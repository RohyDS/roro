/**
 * OrderImport.js
 * 
 * Importer pour les commandes à partir du format CSV spécifié.
 * Colonnes attendues : date, heure, client, achat, status
 * Exemple : 05/05/2026,11:30,john@rakoto.com,"{["sk-l";3]}",completed
 */

import api from '../../../config/api.js';
import ProductImport from './ProductImport.js';
import CustomerImport from './CustomerImport.js';

// ─── PARSER CSV ROBUSTE ────────────────────────────────────────────────────────

const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
};

const parseCSV = (text) => {
    if (!text?.trim()) return [];
    
    // Séparation des lignes (gère \r\n et \n)
    const rawLines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (rawLines.length === 0) return [];

    // Récupération des en-têtes
    const headers = parseLine(rawLines[0]).map(h => h.toLowerCase().trim());
    console.log(`%c[Commande CSV] En-têtes : (${headers.length}) [${headers.join(', ')}]`, 'color:#a855f7; font-weight:bold;');

    const rows = [];
    for (let i = 1; i < rawLines.length; i++) {
        const values = parseLine(rawLines[i]);
        
        if (values.length < headers.length) {
            console.warn(`%c[Commande CSV] Ligne ${i + 1} incomplète (ignorée)`, 'color:orange');
            continue;
        }

        const row = { _lineNumber: i + 1 };
        headers.forEach((header, index) => {
            row[header] = values[index];
        });

        rows.push(row);
    }

    console.log(`%c[Commande CSV] ✅ ${rows.length} ligne(s) valide(s) trouvée(s).`, 'color:#10b981');
    return rows;
};

// ─── UTILS DE PARSING DE L'ACHAT ET CLIENT ─────────────────────────────────────

/**
 * Extrait le nom et prénom d'une adresse email
 */
const parseEmailName = (email) => {
    try {
        const parts = email.split('@');
        const namePart = parts[0];
        const domainPart = parts[1] || '';
        
        let first = namePart;
        let last = domainPart.split('.')[0] || 'Client';
        
        // Capitaliser les premières lettres
        first = first.charAt(0).toUpperCase() + first.slice(1);
        last = last.charAt(0).toUpperCase() + last.slice(1);
        
        return { firstName: first, lastName: last };
    } catch (e) {
        return { firstName: 'Client', lastName: 'Importe' };
    }
};

/**
 * Parse la chaîne d'achat : "{["sku";quantity],["sku";quantity]}"
 */
const parseAchat = (achatStr) => {
    const items = [];
    if (!achatStr) return items;
    
    // Normaliser les guillemets doublés de CSV et enlever les guillemets externes
    const normalized = achatStr.replace(/""/g, '"').replace(/^"/, '').replace(/"$/, '');
    
    // Regex pour capturer [sku;quantité] ou ["sku";quantité]
    const regex = /\["?([^"\];,\s]+)"?\s*[;,]\s*(\d+)\]/g;
    let match;
    while ((match = regex.exec(normalized)) !== null) {
        items.push({
            sku: match[1].trim(),
            quantity: parseInt(match[2], 10)
        });
    }
    
    return items;
};

// ─── AUTHENTIFICATION CLIENT EN DIRECT ─────────────────────────────────────────

const loginTokens = {};

const clearOrderImportCache = () => {
    for (const key in loginTokens) {
        delete loginTokens[key];
    }
};

const loginCustomer = async (email, password = '1234567890') => {
    const key = email.toLowerCase().trim();
    if (loginTokens[key]) {
        console.log(`%c  [Client] ✓ Cache : déjà connecté / Token récupéré pour <${email}>`, 'color:#6366f1');
        api.defaults.headers.common['Authorization'] = `Bearer ${loginTokens[key]}`;
        localStorage.setItem('customer_token', loginTokens[key]);
        return loginTokens[key];
    }

    try {
        const response = await api.post('v1/customer/login', {
            email: email,
            password: password,
            device_name: 'React Admin Importer'
        });
        if (response.data && response.data.token) {
            const token = response.data.token;
            loginTokens[key] = token;
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('customer_token', token);
            return token;
        }
        throw new Error("Identifiants incorrects ou réponse API incomplète");
    } catch (error) {
        console.error(`[Auth Client] Erreur de connexion pour ${email}:`, error.response?.data || error.message);
        throw error;
    }
};

// ─── IMPORTATION D'UNE LIGNE DE COMMANDE ───────────────────────────────────────

const importOrderRow = async (row) => {
    const email = row.client?.trim() || row.email?.trim();
    const achatStr = row.achat?.trim();
    const status = row.status?.trim()?.toLowerCase() || 'pending';
    
    if (!email) {
        console.error(`%c[Ligne ${row._lineNumber}] ❌ Email client manquant → Commande ignorée.`, 'color:#ef4444');
        return { success: false, error: 'Email client manquant' };
    }

    if (!achatStr) {
        console.error(`%c[Ligne ${row._lineNumber}] ❌ Liste d'achats manquante → Commande ignorée.`, 'color:#ef4444');
        return { success: false, error: 'Liste d\'achats manquante' };
    }

    console.log(
        `%c[Ligne ${row._lineNumber}] ▶ Import commande pour <${email}> | Statut: ${status}`,
        'color:#f59e0b; font-weight:bold;'
    );

    // ÉTAPE A : S'assurer que le client existe (l'enregistrer s'il n'existe pas)
    const { firstName, lastName } = parseEmailName(email);
    console.log(`  [Client] Vérification/Création de "${firstName} ${lastName}"...`);
    try {
        await CustomerImport.importCustomerRow({
            nom: lastName,
            prenom: firstName,
            email: email,
            pwd: '1234567890'
        });
    } catch (customerErr) {
        console.warn(`  [Client] Warning lors de la création du client:`, customerErr.message);
    }

    // ÉTAPE B : Connexion du client pour obtenir son token
    console.log(`  [Client] Connexion en tant que ${email}...`);
    try {
        await loginCustomer(email, '1234567890');
    } catch (loginErr) {
        const errorMsg = loginErr.response?.data?.message || loginErr.message;
        console.error(`%c  [Client] ❌ Connexion échouée pour ${email}: ${errorMsg}`, 'color:#ef4444');
        return { success: false, error: `Authentification client échouée: ${errorMsg}` };
    }

    // ÉTAPE C : Résoudre les SKUs en IDs de produits
    const purchaseItems = parseAchat(achatStr);
    if (purchaseItems.length === 0) {
        console.error(`%c  [Achat] ❌ Aucun produit valide détecté dans le format d'achat: "${achatStr}"`, 'color:#ef4444');
        return { success: false, error: 'Format d\'achat invalide ou vide' };
    }

    const cartItems = [];
    console.log(`  [Achat] Résolution des SKUs dans le catalogue...`);
    for (const item of purchaseItems) {
        const productId = await ProductImport.getProductIdBySku(item.sku);
        if (!productId) {
            const errorMsg = `Produit SKU "${item.sku}" introuvable dans le catalogue.`;
            console.error(`%c  [Achat] ❌ ${errorMsg}`, 'color:#ef4444');
            return { success: false, error: errorMsg };
        }
        cartItems.push({ id: productId, quantity: item.quantity });
    }

    // ÉTAPE D : Gestion du Panier (Nettoyage & Remplissage)
    try {
        console.log(`  [Panier] 1/2 Vider le panier existant...`);
        await api.delete('v1/customer/cart/remove');
    } catch (clearErr) {
        console.warn(`  [Panier] Warning lors du nettoyage du panier:`, clearErr.message);
    }

    try {
        console.log(`  [Panier] 2/2 Ajout des produits résolus...`);
        for (const item of cartItems) {
            console.log(`        -> Produit ID ${item.id} | Qté: ${item.quantity}`);
            await api.post(`v1/customer/cart/add/${item.id}`, {
                product_id: item.id,
                quantity: item.quantity
            });
        }
    } catch (cartAddErr) {
        const errorMsg = cartAddErr.response?.data?.message || cartAddErr.message;
        console.error(`%c  [Panier] ❌ Échec de l'ajout au panier: ${errorMsg}`, 'color:#ef4444');
        return { success: false, error: `Panier échoué: ${errorMsg}` };
    }

    // ÉTAPE E : Enregistrement de l'adresse de livraison
    let selectedShippingMethod = 'free_free';
    try {
        console.log(`  [Checkout] 1/4 Enregistrement des adresses...`);
        const addressPayload = {
            billing: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                address: ["Adresse par defaut d'importation"],
                city: "Paris",
                state: "IDF",
                country: "FR",
                postcode: "75001",
                phone: "0102030405",
                use_for_shipping: true
            },
            shipping: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                address: ["Adresse par defaut d'importation"],
                city: "Paris",
                state: "IDF",
                country: "FR",
                postcode: "75001",
                phone: "0102030405"
            }
        };

        const resAddress = await api.post('v1/customer/checkout/save-address', addressPayload);
        
        // Résolution dynamique du mode de livraison
        const rates = resAddress.data?.data?.rates || [];
        if (rates.length > 0 && rates[0].rates && rates[0].rates.length > 0) {
            selectedShippingMethod = rates[0].rates[0].method || rates[0].rates[0].code || 'free_free';
        }
        console.log(`        -> Mode de livraison auto-détecté: "${selectedShippingMethod}"`);
    } catch (addressErr) {
        const errorMsg = addressErr.response?.data?.message || addressErr.message;
        console.error(`%c  [Checkout] ❌ Échec de la sauvegarde d'adresse: ${errorMsg}`, 'color:#ef4444');
        return { success: false, error: `Adresse échouée: ${errorMsg}` };
    }

    // ÉTAPE F : Sélection du mode d'expédition
    try {
        console.log(`  [Checkout] 2/4 Enregistrement de la livraison...`);
        await api.post('v1/customer/checkout/save-shipping', {
            shipping_method: selectedShippingMethod
        });
    } catch (shippingErr) {
        const errorMsg = shippingErr.response?.data?.message || shippingErr.message;
        console.error(`%c  [Checkout] ❌ Échec du mode d'expédition: ${errorMsg}`, 'color:#ef4444');
        return { success: false, error: `Livraison échouée: ${errorMsg}` };
    }

    // ÉTAPE G : Sélection du mode de paiement (Cash on delivery)
    try {
        console.log(`  [Checkout] 3/4 Enregistrement du paiement...`);
        await api.post('v1/customer/checkout/save-payment', {
            payment: {
                method: 'cashondelivery'
            }
        });
    } catch (paymentErr) {
        const errorMsg = paymentErr.response?.data?.message || paymentErr.message;
        console.error(`%c  [Checkout] ❌ Échec du mode de paiement: ${errorMsg}`, 'color:#ef4444');
        return { success: false, error: `Paiement échoué: ${errorMsg}` };
    }

    // ÉTAPE H : Validation finale et création de la commande
    let orderId = null;
    try {
        console.log(`  [Checkout] 4/4 Enregistrement final de la commande...`);
        const resOrder = await api.post('v1/customer/checkout/save-order');
        
        orderId = resOrder.data?.data?.order?.id || resOrder.data?.data?.id || resOrder.data?.order?.id || resOrder.data?.id;
        console.log(`%c  [Checkout] ✅ Commande créée avec succès ! ID: #${orderId}`, 'color:#10b981; font-weight:bold;');
    } catch (orderErr) {
        const errorMsg = orderErr.response?.data?.message || orderErr.message;
        console.error(`%c  [Checkout] ❌ Échec de la création de commande: ${errorMsg}`, 'color:#ef4444');
        return { success: false, error: `Création de commande échouée: ${errorMsg}` };
    }

    // ÉTAPE I : Si la commande est complétée dans le CSV, on crée sa facture & livraison
    if (orderId && status === 'completed') {
        try {
            console.log(`  [Admin Sales] Commande marquée comme 'completed' dans le CSV → Création Facture & Expédition (Admin)...`);
            
            // Récupérer le détail de la commande pour avoir les ID des lignes de commande
            const orderRes = await api.get(`v1/admin/sales/orders/${orderId}`);
            const orderData = orderRes.data?.data;
            const items = orderData?.items || [];
            
            if (items.length > 0) {
                const invoiceItems = {};
                const shipmentItems = {};
                
                items.forEach(item => {
                    const qty = item.qty_to_invoice || item.qty_ordered || 1;
                    invoiceItems[item.id] = qty;
                    shipmentItems[item.id] = {
                        "1": qty
                    };
                });
                
                // 1. Facturer la commande
                try {
                    await api.post(`v1/admin/sales/invoices/${orderId}`, {
                        invoice: { items: invoiceItems }
                    });
                    console.log(`  [Facture] ✅ Créée et validée pour la commande #${orderId}`);
                } catch (invoiceErr) {
                    console.warn(`  [Facture] ⚠️ Création impossible :`, invoiceErr.response?.data || invoiceErr.message);
                }
                
                // 2. Expédier la commande (ce qui passe le statut de la commande à 'completed')
                try {
                    await api.post(`v1/admin/sales/shipments/${orderId}`, {
                        shipment: {
                            carrier_title: "Livraison Standard Importée",
                            track_number: "TRK-" + orderId,
                            source: 1,
                            items: shipmentItems
                        }
                    });
                    console.log(`  [Livraison] ✅ Créée et validée. Commande #${orderId} finalisée (completed) !`);
                } catch (shipmentErr) {
                    console.warn(`  [Livraison] ⚠️ Création impossible :`, shipmentErr.response?.data || shipmentErr.message);
                }
            } else {
                console.warn(`  [Admin Sales] ⚠️ Aucun article trouvé pour la commande #${orderId} lors de la complétion.`);
            }
        } catch (salesErr) {
            console.warn(`  [Admin Sales] ⚠️ Échec de la complétion de la commande #${orderId} (mais la commande a été créée) :`, salesErr.message);
        }
    }

    return { success: true, orderId };
};

export default {
    parseCSV,
    importOrderRow,
    clearOrderImportCache
};
