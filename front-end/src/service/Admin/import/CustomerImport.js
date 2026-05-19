/**
 * CustomerImport.js
 * 
 * Importer pour les clients à partir du format CSV spécifié.
 * Colonnes attendues : nom, prenom, email, pwd
 */

import api from '../../../config/api.js';

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
    console.log(`%c[Client CSV] En-têtes : (${headers.length}) [${headers.join(', ')}]`, 'color:#8b5cf6; font-weight:bold;');

    const rows = [];
    for (let i = 1; i < rawLines.length; i++) {
        const values = parseLine(rawLines[i]);
        
        // Si le nombre de colonnes ne correspond pas, on essaie quand même de parser ou on log
        if (values.length < headers.length) {
            console.warn(`%c[Client CSV] Ligne ${i + 1} incomplète (ignorée)`, 'color:orange');
            continue;
        }

        const row = { _lineNumber: i + 1 };
        headers.forEach((header, index) => {
            row[header] = values[index];
        });

        rows.push(row);
    }

    console.log(`%c[Client CSV] ✅ ${rows.length} ligne(s) valide(s) trouvée(s).`, 'color:#10b981');
    return rows;
};

// Cache des clients (email -> true)
const customerCache = {};

/**
 * Réinitialise le cache des clients.
 */
const clearCustomerCache = () => {
    for (const key in customerCache) {
        delete customerCache[key];
    }
};

// ─── IMPORTATION D'UN CLIENT ───────────────────────────────────────────────────

/**
 * Crée un client via l'API publique de Bagisto.
 * URL : v1/customer/register
 */
const importCustomerRow = async (row) => {
    const lastName = row.nom?.trim();
    const firstName = row.prenom?.trim();
    const email = row.email?.trim()?.toLowerCase();
    const password = row.pwd?.trim();

    if (!email) {
        console.warn(`%c  [Client Ligne ${row._lineNumber}] ⚠️ Email manquant → ignoré.`, 'color:orange');
        return { success: false, reason: 'Email manquant' };
    }

    if (customerCache[email]) {
        console.log(`%c  [Client] ✓ Cache : <${email}> déjà enregistré / vérifié.`, 'color:#6366f1');
        return { success: true, duplicate: true };
    }

    if (!firstName || !lastName) {
        console.warn(`%c  [Client Ligne ${row._lineNumber}] ⚠️ Prénom ou Nom manquant pour ${email} → ignoré.`, 'color:orange');
        return { success: false, reason: 'Nom/Prénom manquant' };
    }

    const payload = {
        first_name:            firstName,
        last_name:             lastName,
        email:                 email,
        password:              password || '1234567890', // fallback si vide
        password_confirmation: password || '1234567890',
    };

    console.log(
        `%c  [Client] Enregistrement — "${firstName} ${lastName}" | <${email}>`,
        'color:#3b82f6'
    );

    try {
        const res = await api.post('v1/customer/register', payload);
        console.log(`%c  [Client] ✅ Créé avec succès !`, 'color:#10b981; font-weight:bold;');
        customerCache[email] = true;
        return { success: true, created: true };
    } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;
        const message = data?.message || data?.error || error.message || '';

        // Si l'adresse e-mail est déjà prise
        if (status === 422 || message.includes('already taken') || message.includes('déjà pris')) {
            console.log(`%c  [Client] ⚠️ Déjà enregistré / Email déjà pris : ${email}`, 'color:#f59e0b');
            customerCache[email] = true;
            return { success: true, duplicate: true };
        }

        console.error(
            `%c  [Client] ❌ Erreur ${status || 'Réseau'} :`, 
            'color:#ef4444', 
            data || error.message
        );
        return { success: false, error: message };
    }
};

export default {
    parseCSV,
    importCustomerRow,
    clearCustomerCache
};
