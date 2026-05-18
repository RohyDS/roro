import api from '../../../config/api.js';
import ProductImport from './ProductImport.js';

let jszipLoadedPromise = null;

/**
 * Charge dynamiquement la bibliothèque JSZip depuis un CDN
 */
const loadJSZip = () => {
    if (window.JSZip) {
        return Promise.resolve(window.JSZip);
    }
    if (jszipLoadedPromise) {
        return jszipLoadedPromise;
    }
    
    jszipLoadedPromise = new Promise((resolve, reject) => {
        console.log("%c[JSZip] Chargement de la bibliothèque JSZip depuis le CDN...", "color: #3b82f6");
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.onload = () => {
            console.log("%c[JSZip] ✅ Bibliothèque JSZip chargée avec succès !", "color: #10b981");
            resolve(window.JSZip);
        };
        script.onerror = (err) => {
            console.error("[JSZip] ❌ Échec de chargement de la bibliothèque JSZip", err);
            reject(new Error("Impossible de charger la bibliothèque d'extraction ZIP (JSZip)."));
        };
        document.head.appendChild(script);
    });
    return jszipLoadedPromise;
};

/**
 * Importe un fichier ZIP d'images de produits
 * @param {File} file Le fichier ZIP contenant les images
 * @param {Function} onProgress Callback de progression (facultatif)
 */
export const importZipFile = async (file, onProgress) => {
    try {
        // 1. Charger JSZip
        const JSZip = await loadJSZip();
        
        // 2. Parser le fichier ZIP
        console.log("[ImportImage] Lecture et extraction du dossier ZIP...");
        const zip = await JSZip.loadAsync(file);
        
        const imageFiles = [];
        zip.forEach((relativePath, zipEntry) => {
            // Ignorer les dossiers, les fichiers cachés et les fichiers systèmes OS (ex: __MACOSX)
            if (zipEntry.dir || relativePath.startsWith('__MACOSX/') || relativePath.split('/').pop().startsWith('.')) {
                return;
            }
            // Vérifier si l'extension correspond à une image acceptée
            const extension = relativePath.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(extension)) {
                imageFiles.push(zipEntry);
            }
        });

        if (imageFiles.length === 0) {
            throw new Error("Aucune image valide trouvée dans le fichier ZIP. Formats acceptés : JPG, JPEG, PNG, WEBP, BMP.");
        }

        console.log(`%c[ImportImage] 📦 ${imageFiles.length} image(s) valide(s) extraite(s) du ZIP.`, "color: #a855f7; font-weight: bold;");
        
        let successes = 0;
        let errors = 0;
        const results = [];

        // 3. Traiter et uploader chaque image
        for (let i = 0; i < imageFiles.length; i++) {
            const imageEntry = imageFiles[i];
            const fullName = imageEntry.name;
            const fileNameWithExt = fullName.split('/').pop();
            
            // Le nom du fichier sans extension correspond au SKU
            const skuCandidate = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.')).trim();
            
            console.log(`%c[ImportImage] Image ${i + 1}/${imageFiles.length} : "${fileNameWithExt}" (SKU ciblé: "${skuCandidate}")`, "color: #3b82f6");
            
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: imageFiles.length,
                    fileName: fileNameWithExt,
                    sku: skuCandidate,
                    status: 'processing'
                });
            }

            try {
                // Trouver le produit en base par son SKU
                const productId = await ProductImport.getProductIdBySku(skuCandidate);
                
                if (!productId) {
                    throw new Error(`Aucun produit avec le SKU "${skuCandidate}" n'a été trouvé dans le catalogue.`);
                }

                // 1. Récupérer les informations complètes existantes du produit
                console.log(`[ImportImage] Récupération des détails du produit ID ${productId} pour validation...`);
                const prodRes = await api.get(`v1/admin/catalog/products/${productId}?locale=fr`);
                const product = prodRes.data?.data || prodRes.data;

                if (!product) {
                    throw new Error("Impossible de récupérer les détails existants du produit.");
                }

                // Convertir le contenu ZIP en blob d'image
                const blob = await imageEntry.async("blob");
                
                // Déterminer le type MIME
                const mimeType = getMimeType(fileNameWithExt);
                const fileToUpload = new File([blob], fileNameWithExt, { type: mimeType });

                // Construire le formulaire multipart/form-data
                const formData = new FormData();
                formData.append('_method', 'PUT'); // Bagisto nécessite un PUT émulé pour modifier un produit
                
                // Remplir TOUS les champs requis par la validation Bagisto ProductForm
                formData.append('sku', product.sku || skuCandidate);
                formData.append('name', product.name || skuCandidate);
                formData.append('url_key', product.url_key || skuCandidate.toLowerCase());
                formData.append('short_description', product.short_description || product.name || skuCandidate);
                formData.append('description', product.description || product.name || skuCandidate);
                formData.append('price', product.price || 0);
                formData.append('weight', product.weight || 1.5);
                formData.append('status', product.status !== undefined ? product.status : 1);
                formData.append('visible_individually', product.visible_individually !== undefined ? product.visible_individually : 1);
                
                // Informations de canal et paramètres requis
                formData.append('channel', 'default');
                formData.append('channels[0]', 1);
                formData.append('locale', 'fr');

                // Associer les catégories déjà existantes du produit
                if (Array.isArray(product.categories)) {
                    product.categories.forEach((cat, index) => {
                        const catId = cat.id || cat;
                        if (catId) {
                            formData.append(`categories[${index}]`, catId);
                        }
                    });
                } else if (product.categories) {
                    formData.append('categories[0]', product.categories);
                }

                // Ajouter le fichier image
                formData.append('images[files][image_0]', fileToUpload);

                console.log(`[ImportImage] Envoi de l'image et des attributs requis pour le produit ID ${productId}...`);
                
                // Envoyer la requête multipart à l'API Bagisto Admin
                await api.post(`v1/admin/catalog/products/${productId}?locale=fr`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                successes++;
                results.push({ sku: skuCandidate, fileName: fileNameWithExt, success: true });
                console.log(`%c[ImportImage] ✅ Image pour "${skuCandidate}" importée et associée avec succès.`, "color: #10b981; font-weight: bold;");
            } catch (err) {
                errors++;
                const errorMessage = err.response?.data?.message || err.message;
                results.push({ sku: skuCandidate, fileName: fileNameWithExt, success: false, error: errorMessage });
                console.error(`%c[ImportImage] ❌ Échec pour "${skuCandidate}" : ${errorMessage}`, "color: #ef4444");
            }
        }

        return {
            total: imageFiles.length,
            successes,
            errors,
            details: results
        };

    } catch (error) {
        console.error("[ImportImage] ❌ Erreur générale de traitement ZIP:", error);
        throw error;
    }
};

/**
 * Détermine le type MIME adéquat à partir de l'extension de fichier
 */
const getMimeType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
        case 'png': return 'image/png';
        case 'webp': return 'image/webp';
        case 'bmp': return 'image/bmp';
        case 'jpg':
        case 'jpeg':
        default:
            return 'image/jpeg';
    }
};

const ImportImage = {
    importZipFile
};

export default ImportImage;
