/**
 * ProductImport.js — Version corrigée
 * 
 * Corrections appliquées :
 *  1. Catégorie  : payload plat (pas imbriqué), récupération robuste de l'ID après 422
 *  2. Recherche SKU : utilise GET /products sans filtre sku[eq] qui casse Bagisto
 *  3. POST Produit  : si SQLSTATE 23000 (doublon), cherche l'ID via listing paginé
 */

import api from '../../../config/api.js';

// ─── Cache catégories slug → id ───────────────────────────────────────────────
const categoryCache = {};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PARSER CSV
// ═══════════════════════════════════════════════════════════════════════════════

const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { values.push(current.trim().replace(/^"|"$/g, '')); current = ''; }
        else { current += char; }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
};

const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = parseLine(lines[0]).map(h => h.trim());
    console.log('%c[CSV] En-têtes :', 'color:#6366f1', headers);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = parseLine(line);
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
        row._lineNumber = i + 1;
        if (row.sku?.trim()) rows.push(row);
    }
    console.log(`%c[CSV] ✅ ${rows.length} ligne(s) valide(s).`, 'color:#10b981');
    return rows;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

const toSlug = (name) =>
    name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

const parsePrice = (v) => {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CATÉGORIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Charge toutes les catégories dans le cache.
 * Appeler une fois au montage du composant.
 */
const loadExistingCategories = async () => {
    // Vider le cache existant pour éviter les IDs obsolètes suite à un reset de base de données
    for (const key in categoryCache) {
        delete categoryCache[key];
    }
    try {
        const res = await api.get('v1/admin/catalog/categories');
        const raw = res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : (raw.data || []);
        list.forEach(cat => {
            if (cat.slug && cat.id) categoryCache[cat.slug.toLowerCase()] = cat.id;
        });
        console.log(`%c[Catégories] ✅ ${list.length} catégorie(s) en cache.`, 'color:#10b981');
    } catch (e) {
        console.warn('%c[Catégories] ⚠️ Pré-chargement impossible.', 'color:orange', e.message);
    }
};

/**
 * FIX #1 — Payload catégorie plat (sans imbrication fr:{}).
 * Récupère l'ID même quand Bagisto retourne 422 (slug déjà pris).
 */
const findOrCreateCategory = async (name) => {
    if (!name?.trim()) return null;
    const slug = toSlug(name.trim());

    if (categoryCache[slug]) {
        console.log(`%c  [Cat] ✓ Cache : "${name}" → ID ${categoryCache[slug]}`, 'color:#6366f1');
        return categoryCache[slug];
    }

    console.log(`%c  [Cat] Création : "${name}" (slug: ${slug})`, 'color:#8b5cf6');

    // Payload PLAT — c'est ce que l'API Bagisto attend réellement
    const payload = {
        name:         name.trim(),
        slug:         slug,
        position:     1,
        status:       1,
        display_mode: 'products_and_description',
        description:  `Catégorie ${name.trim()}`,
        locale:       'fr',
        channel:      'default',
        attributes:   [11],
        parent_id:    1,
    };

    try {
        const res = await api.post('v1/admin/catalog/categories', payload);
        const created = res.data?.data || res.data;

        if (created?.id) {
            categoryCache[slug] = created.id;
            console.log(`%c  [Cat] ✅ Créée → ID ${created.id}`, 'color:#10b981');
            return created.id;
        }

        // Parfois Bagisto retourne 200 mais la structure est différente
        const id = created?.category?.id || created?.data?.id;
        if (id) {
            categoryCache[slug] = id;
            return id;
        }

        console.warn('%c  [Cat] ⚠️ Réponse inattendue :', 'color:orange', res.data);
        return null;

    } catch (error) {
        const status  = error.response?.status;
        const errData = error.response?.data;

        // 422 = slug déjà pris → recharger le cache
        if (status === 422) {
            console.warn(`%c  [Cat] ⚠️ Slug déjà existant. Rechargement cache...`, 'color:orange');
            await loadExistingCategories();
            if (categoryCache[slug]) {
                console.log(`%c  [Cat] ✅ ID trouvé après rechargement : ${categoryCache[slug]}`, 'color:#10b981');
                return categoryCache[slug];
            }
            // Bagisto inclut parfois l'ID dans les erreurs de validation
            const idInError = errData?.data?.id || errData?.id;
            if (idInError) { categoryCache[slug] = idInError; return idInError; }
        }

        console.error(`%c  [Cat] ❌ Erreur ${status} :`, 'color:#ef4444', errData || error.message);
        return null;
    }
};

/**
 * Récupère toutes les catégories depuis l'API Bagisto.
 */
const getCategories = async () => {
    try {
        const res = await api.get('v1/admin/catalog/categories');
        const raw = res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : (raw.data || []);
        return list;
    } catch (e) {
        console.error("Erreur dans getCategories:", e);
        throw e;
    }
};

/**
 * Crée une nouvelle catégorie dans Bagisto.
 */
const createCategory = async (name) => {
    const slug = toSlug(name.trim());
    const payload = {
        name:         name.trim(),
        slug:         slug,
        position:     1,
        status:       1,
        display_mode: 'products_and_description',
        description:  `Catégorie ${name.trim()}`,
        locale:       'fr',
        channel:      'default',
        attributes:   [11],
        parent_id:    1,
    };
    const res = await api.post('v1/admin/catalog/categories', payload);
    const created = res.data?.data || res.data;
    return created;
};


// ═══════════════════════════════════════════════════════════════════════════════
// 4. PRODUITS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * FIX #2 — Recherche SKU sans filtre sku[eq] qui cause l'erreur PHP explode().
 * On récupère la liste paginée et on filtre côté JS.
 */
const getProductIdBySku = async (sku) => {
    console.log(`%c  [SKU] Recherche de l'ID pour "${sku}"...`, 'color:#8b5cf6');
    try {
        // On passe le SKU comme filtre simple — Bagisto l'accepte en query string directe
        const res = await api.get('v1/admin/catalog/products', {
            params: { limit: 50 }  // ← PAS de params sku ici, on filtre côté JS
        });

        const raw  = res.data?.data?.data || res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : [];
        const found = list.find(p => p.sku === sku);

        if (found) {
            console.log(`%c  [SKU] ✅ Trouvé → ID ${found.id}`, 'color:#10b981');
            return found.id;
        }

        console.warn(`%c  [SKU] ⚠️ SKU "${sku}" introuvable dans la liste.`, 'color:orange');
        return null;
    } catch (e) {
        console.error(`%c  [SKU] ❌ Erreur recherche :`, 'color:#ef4444', e.message);
        return null;
    }
};

/**
 * FIX #3 — POST produit. Si SQLSTATE 23000 (doublon), on cherche l'ID existant.
 */
const createProductSkeleton = async (sku, type = 'simple') => {
    console.log(`%c  [Produit] ① POST squelette — SKU: "${sku}"`, 'color:#8b5cf6');
    try {
        const res = await api.post('v1/admin/catalog/products', {
            type:                type || 'simple',
            attribute_family_id: 1,
            sku:                 sku,
        });

        const product = res.data?.data || res.data;
        if (product?.id) {
            console.log(`%c  [Produit] ✅ Créé → ID ${product.id}`, 'color:#10b981');
            return product.id;
        }

        console.warn('%c  [Produit] ⚠️ Réponse inattendue (POST) :', 'color:orange', res.data);
        return null;

    } catch (error) {
        const status  = error.response?.status;
        const message = error.response?.data?.message || '';

        // 422 = validation / SKU déjà pris
        if (status === 422) {
            console.warn(`%c  [Produit] ⚠️ 422 SKU déjà existant. Recherche ID...`, 'color:orange');
            return await getProductIdBySku(sku);
        }

        // FIX #3 — 500 SQLSTATE 23000 = doublon en DB (SKU partiellement créé)
        if (status === 500 && message.includes('23000')) {
            console.warn(`%c  [Produit] ⚠️ Doublon DB (SQLSTATE 23000). Recherche ID...`, 'color:orange');
            return await getProductIdBySku(sku);
        }

        console.error(`%c  [Produit] ❌ Erreur POST ${status} :`, 'color:#ef4444', error.response?.data || error.message);
        return null;
    }
};

/**
 * PUT — Met à jour le produit avec toutes les données.
 */
const updateProduct = async (productId, row, categoryId) => {
    console.log(`%c  [Produit] ② PUT données — ID: ${productId}`, 'color:#8b5cf6');

    const urlKey = toSlug(row.name?.trim() || row.sku);

    const payload = {
        sku:                  row.sku?.trim(),
        name:                 row.name?.trim() || row.sku?.trim(),
        url_key:              urlKey,
        short_description:    row.name?.trim() || '',
        description:          row.name?.trim() || '',
        channel:              'default',
        channels:             [1],
        locale:               'fr',
        price:                parsePrice(row.prix_vente) ?? 0,
        cost:                 parsePrice(row.prix_achat) ?? 0,
        weight:               1.5,
        manage_stock:         1,
        status:               1,
        visible_individually: 1,
        inventories:          { '1': parseInt(row.stock_initial) || 0 },
    };

    const promo = parsePrice(row.prix_promo);
    if (promo !== null) payload.special_price = promo;
    if (categoryId)     payload.categories    = [categoryId];

    try {
        await api.put(`v1/admin/catalog/products/${productId}?locale=fr`, payload);
        console.log(
            `%c  [Produit] ✅ "${payload.name}" — prix:${payload.price}€` +
            (promo !== null ? ` promo:${promo}€` : '') +
            ` stock:${payload.inventories['1']}`,
            'color:#10b981'
        );
        return true;
    } catch (error) {
        console.error(`%c  [Produit] ❌ Erreur PUT ${error.response?.status} :`, 'color:#ef4444', error.response?.data || error.message);
        return false;
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. IMPORT D'UNE LIGNE
// ═══════════════════════════════════════════════════════════════════════════════

const importRow = async (row) => {
    const sku  = row.sku?.trim();
    const name = row.name?.trim() || sku;
    const type = row.type?.trim() || 'simple';

    if (!sku) {
        console.warn(`%c  [Ligne ${row._lineNumber}] ⚠️ SKU vide → ignoré.`, 'color:orange');
        return { success: false, reason: 'SKU manquant' };
    }

    console.log(
        `%c[Ligne ${row._lineNumber}] ▶ "${sku}" | "${name}" | Cat: "${row.Categorie || '—'}"`,
        'color:#f59e0b;font-weight:bold'
    );

    // A — Catégorie
    let categoryId = null;
    const catName = row.Categorie?.trim() || row.categorie?.trim();
    if (catName) categoryId = await findOrCreateCategory(catName);

    // B — Squelette
    const productId = await createProductSkeleton(sku, type);
    if (!productId) {
        console.error(`%c  [Ligne ${row._lineNumber}] ❌ Impossible d'obtenir l'ID produit.`, 'color:#ef4444');
        return { success: false, reason: 'ID produit introuvable' };
    }

    // C — Données complètes
    const ok = await updateProduct(productId, row, categoryId);

    if (ok) console.log(`%c  [Ligne ${row._lineNumber}] ✅ Succès (ID: ${productId})`, 'color:#10b981;font-weight:bold');
    else    console.error(`%c  [Ligne ${row._lineNumber}] ❌ Mise à jour échouée.`, 'color:#ef4444');

    return { success: ok, productId };
};

// ─── Export ───────────────────────────────────────────────────────────────────
const ProductImport = {
    parseCSV,
    importRow,
    loadExistingCategories,
    findOrCreateCategory,
    createProductSkeleton,
    updateProduct,
    getProductIdBySku,
    getCategories,
    createCategory,
};

export default ProductImport;