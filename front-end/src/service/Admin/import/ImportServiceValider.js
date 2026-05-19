/**
 * ImportServiceValider.js
 * 
 * Service dédié à la validation des fichiers d'importation.
 */

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

const parseAchat = (achatStr) => {
    const items = [];
    if (!achatStr) return items;
    
    const normalized = achatStr.replace(/""/g, '"').replace(/^"/, '').replace(/"$/, '');
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

const ImportServiceValider = {
    validateOrderCSV: (text) => {
        const errors = [];
        if (!text?.trim()) {
            errors.push("Le fichier est vide.");
            return { isValid: false, errors };
        }

        const rawLines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (rawLines.length === 0) {
            errors.push("Le fichier ne contient aucune ligne.");
            return { isValid: false, errors };
        }

        // 1. Vérification des noms de colonne
        const expectedHeaders = ['date', 'heure', 'client', 'achat', 'status'];
        const headers = parseLine(rawLines[0]).map(h => h.toLowerCase().trim());
        
        const invalidHeaders = headers.filter(h => !expectedHeaders.includes(h));
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));

        if (invalidHeaders.length > 0 || missingHeaders.length > 0) {
            if (invalidHeaders.length > 0) {
                errors.push(`Nom de colonne non existante dans l'import : ${invalidHeaders.join(', ')}`);
            }
            if (missingHeaders.length > 0) {
                errors.push(`Nom de colonne manquant : ${missingHeaders.join(', ')}`);
            }
            return { isValid: false, errors }; // Arrêt si les colonnes sont mauvaises
        }

        const dateIdx = headers.indexOf('date');
        const achatIdx = headers.indexOf('achat');

        // Vérification des lignes
        for (let i = 1; i < rawLines.length; i++) {
            const values = parseLine(rawLines[i]);
            if (values.length < headers.length) continue;

            // 2. Vérification du format de date DD/MM/YYYY
            const dateVal = values[dateIdx]?.trim();
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
            if (!dateRegex.test(dateVal)) {
                errors.push(`Ligne ${i + 1} : format de date différente de DD/MM/YYYY ("${dateVal}")`);
            }

            // 3. Vérification du montant (quantité) positif
            const achatVal = values[achatIdx];
            const items = parseAchat(achatVal);
            for (const item of items) {
                if (item.quantity <= 0 || isNaN(item.quantity)) {
                    errors.push(`Ligne ${i + 1} : montant (quantité) non positif ou invalide pour l'achat "${item.sku}" (${item.quantity})`);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

export default ImportServiceValider;
