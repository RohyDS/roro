import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImport from '../../service/Admin/import/ProductImport.js';
import CustomerImport from '../../service/Admin/import/CustomerImport.js';
import OrderImport from '../../service/Admin/import/OrderImport.js';
import ImportImage from '../../service/Admin/import/ImportImage.js';
import api from '../../config/api.js';
import { 
    ArrowLeft, 
    UploadCloud, 
    Users, 
    ShoppingBag, 
    CheckCircle2, 
    FileSpreadsheet, 
    Loader2, 
    PlayCircle, 
    AlertCircle,
    Database,
    ChevronRight,
    Image
} from 'lucide-react';


const UnifiedImporter = () => {
    // Fichiers sélectionnés
    const [productFile, setProductFile] = useState(null);
    const [customerFile, setCustomerFile] = useState(null);
    const [orderFile, setOrderFile] = useState(null);
    const [imageZipFile, setImageZipFile] = useState(null);

    // État général d'importation
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(''); // 'products', 'customers', 'orders', 'images' or ''

    // Rapports de résultats
    const [productReport, setProductReport] = useState(null);
    const [customerReport, setCustomerReport] = useState(null);
    const [orderReport, setOrderReport] = useState(null);
    const [imageZipReport, setImageZipReport] = useState(null);

    const handleProductFileChange = (e) => {
        if (e.target.files[0]) {
            setProductFile(e.target.files[0]);
            setProductReport(null);
        }
    };

    const handleCustomerFileChange = (e) => {
        if (e.target.files[0]) {
            setCustomerFile(e.target.files[0]);
            setCustomerReport(null);
        }
    };

    const handleOrderFileChange = (e) => {
        if (e.target.files[0]) {
            setOrderFile(e.target.files[0]);
            setOrderReport(null);
        }
    };

    const handleImageZipFileChange = (e) => {
        if (e.target.files[0]) {
            setImageZipFile(e.target.files[0]);
            setImageZipReport(null);
        }
    };

    const handleStartImports = async () => {
        if (!productFile && !customerFile && !orderFile && !imageZipFile) {
            alert("Veuillez sélectionner au moins un fichier CSV ou ZIP à importer.");
            return;
        }

        setLoading(true);
        setProductReport(null);
        setCustomerReport(null);
        setOrderReport(null);
        setImageZipReport(null);

        // 1. IMPORTATION DES PRODUITS (si fichier sélectionné)
        if (productFile) {
            setCurrentStep('products');
            await new Promise((resolve) => {
                console.log("%c--- DÉBUT DE L'IMPORTATION PRODUITS ---", "color: #a855f7; font-size: 14px; font-weight: bold;");
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        // Rafraîchir les catégories pour vider le cache obsolète
                        await ProductImport.loadExistingCategories();

                        const text = e.target.result;
                        const rows = ProductImport.parseCSV(text);
                        console.log(`%c[Système] ${rows.length} produits trouvés.`, "color: #a855f7");

                        let successes = 0;
                        let errors = 0;

                        for (let i = 0; i < rows.length; i++) {
                            const row = rows[i];
                            console.log(`%c--- Ligne ${i + 1} / ${rows.length} ---`, "color: #a855f7");
                            const res = await ProductImport.importRow(row);
                            if (res?.success) {
                                successes++;
                            } else {
                                errors++;
                            }
                        }

                        setProductReport({ total: rows.length, successes, errors });
                        console.log("%c--- IMPORTATION PRODUITS TERMINÉE ---", "color: #a855f7; font-size: 14px; font-weight: bold;");
                    } catch (err) {
                        console.error("Erreur lors de l'import des produits:", err);
                        setProductReport({ total: 0, successes: 0, errors: 1, criticalError: true });
                    }
                    resolve();
                };
                reader.readAsText(productFile);
            });
        }

        // 2. IMPORTATION DES CLIENTS (si fichier sélectionné)
        if (customerFile) {
            setCurrentStep('customers');
            await new Promise((resolve) => {
                console.log("%c--- DÉBUT DE L'IMPORTATION CLIENTS ---", "color: #0ea5e9; font-size: 14px; font-weight: bold;");
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const text = e.target.result;
                        const rows = CustomerImport.parseCSV(text);
                        console.log(`%c[Système] ${rows.length} clients trouvés.`, "color: #0ea5e9");

                        let successes = 0;
                        let duplicates = 0;
                        let errors = 0;

                        for (let i = 0; i < rows.length; i++) {
                            const row = rows[i];
                            console.log(`%c--- Ligne ${i + 1} / ${rows.length} ---`, "color: #3b82f6");
                            const res = await CustomerImport.importCustomerRow(row);
                            if (res?.success) {
                                if (res.duplicate) {
                                    duplicates++;
                                } else {
                                    successes++;
                                }
                            } else {
                                errors++;
                            }
                        }

                        setCustomerReport({ total: rows.length, successes, duplicates, errors });
                        console.log("%c--- IMPORTATION CLIENTS TERMINÉE ---", "color: #0ea5e9; font-size: 14px; font-weight: bold;");
                    } catch (err) {
                        console.error("Erreur lors de l'import des clients:", err);
                        setCustomerReport({ total: 0, successes: 0, duplicates: 0, errors: 1, criticalError: true });
                    }
                    resolve();
                };
                reader.readAsText(customerFile);
            });
        }

        // 3. IMPORTATION DES COMMANDES (si fichier sélectionné)
        if (orderFile) {
            setCurrentStep('orders');
            await new Promise((resolve) => {
                console.log("%c--- DÉBUT DE L'IMPORTATION COMMANDES ---", "color: #e11d48; font-size: 14px; font-weight: bold;");
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const text = e.target.result;
                        const rows = OrderImport.parseCSV(text);
                        console.log(`%c[Système] ${rows.length} commandes trouvées.`, "color: #e11d48");

                        let successes = 0;
                        let errors = 0;
                        const errorDetails = [];

                        for (let i = 0; i < rows.length; i++) {
                            const row = rows[i];
                            console.log(`%c--- Ligne ${i + 1} / ${rows.length} ---`, "color: #e11d48");
                            const res = await OrderImport.importOrderRow(row);
                            if (res?.success) {
                                successes++;
                            } else {
                                errors++;
                                errorDetails.push(`Ligne ${row._lineNumber} (Client: ${row.client || 'Inconnu'}): ${res?.error || 'Erreur inconnue'}`);
                            }
                        }

                        setOrderReport({ total: rows.length, successes, errors, errorDetails });
                        console.log("%c--- IMPORTATION COMMANDES TERMINÉE ---", "color: #e11d48; font-size: 14px; font-weight: bold;");
                    } catch (err) {
                        console.error("Erreur lors de l'import des commandes:", err);
                        setOrderReport({ total: 0, successes: 0, errors: 1, criticalError: true, errorDetails: [err.message] });
                    } finally {
                        // Nettoyage complet du token client pour ne pas polluer l'interface admin
                        localStorage.removeItem('customer_token');
                        delete api.defaults.headers.common['Authorization'];
                        
                        // Rétablissement du token admin pour la suite de la navigation
                        const adminToken = localStorage.getItem('admin_token');
                        if (adminToken) {
                            api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
                        }
                    }
                    resolve();
                };
                reader.readAsText(orderFile);
            });
        }

        // 4. IMPORTATION DES IMAGES PRODUITS (si ZIP sélectionné)
        if (imageZipFile) {
            setCurrentStep('images');
            console.log("%c--- DÉBUT DE L'IMPORTATION DES IMAGES (ZIP) ---", "color: #ec4899; font-size: 14px; font-weight: bold;");
            try {
                const report = await ImportImage.importZipFile(imageZipFile, (progress) => {
                    console.log(`%c[Images] Traitement en cours... ${progress.current}/${progress.total} : ${progress.fileName} (SKU: ${progress.sku})`, "color: #ec4899");
                });
                setImageZipReport(report);
                console.log("%c--- IMPORTATION DES IMAGES TERMINÉE ---", "color: #ec4899; font-size: 14px; font-weight: bold;");
            } catch (err) {
                console.error("Erreur lors de l'import des images:", err);
                setImageZipReport({ total: 0, successes: 0, errors: 1, criticalError: true, errorDetails: [err.message] });
            }
        }

        setLoading(false);
        setCurrentStep('');
        alert("Toutes les importations lancées sont terminées !");
    };

    const hasSelectedFiles = !!(productFile || customerFile || orderFile || imageZipFile);

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <Link to="/admin/dashboard" style={styles.backLink}>
                    <ArrowLeft size={18} />
                    <span>Retour au Dashboard</span>
                </Link>
                <h1 style={styles.title}>
                    <Database size={28} style={styles.titleIcon} />
                    <span>Centre d'Importation CSV</span>
                </h1>
                <p style={styles.subtitle}>
                    Sélectionnez vos fichiers CSV pour les produits, les clients, ou les deux, puis lancez le traitement global en un seul clic.
                </p>
            </div>

            {/* Formulaire Unique avec 3 inputs distincts */}
            <div style={styles.formContainer}>
                <div style={styles.formTitleRow}>
                    <FileSpreadsheet size={20} style={{ color: '#4f46e5' }} />
                    <span style={styles.formSectionTitle}>Configuration des fichiers d'importation</span>
                </div>

                <div style={styles.inputsGrid}>
                    
                    {/* INPUT 1: Produits */}
                    <div style={styles.inputCard}>
                        <div style={styles.inputCardHeader}>
                            <ShoppingBag size={18} style={{ color: '#a855f7' }} />
                            <span style={styles.inputCardTitle}>Fichier CSV des Produits</span>
                        </div>
                        <p style={styles.inputCardDesc}>
                            Format simple pour créer/mettre à jour votre catalogue de produits.
                        </p>
                        <div style={styles.fileDropZone}>
                            <UploadCloud size={24} style={styles.uploadIcon} />
                            <span style={styles.dropText}>
                                {productFile ? productFile.name : "Glisser ou parcourir le fichier..."}
                            </span>
                            <input 
                                type="file" 
                                accept=".csv" 
                                onChange={handleProductFileChange} 
                                disabled={loading}
                                style={styles.fileInput}
                                id="product-csv-input"
                            />
                            <label htmlFor="product-csv-input" style={styles.fileLabel}>
                                Sélectionner
                            </label>
                        </div>
                    </div>

                    {/* INPUT 2: Clients */}
                    <div style={styles.inputCard}>
                        <div style={styles.inputCardHeader}>
                            <Users size={18} style={{ color: '#0ea5e9' }} />
                            <span style={styles.inputCardTitle}>Fichier CSV des Clients</span>
                        </div>
                        <p style={styles.inputCardDesc}>
                            Format requis : <code style={styles.code}>nom, prenom, email, pwd</code>.
                        </p>
                        <div style={styles.fileDropZone}>
                            <UploadCloud size={24} style={styles.uploadIconBlue} />
                            <span style={styles.dropText}>
                                {customerFile ? customerFile.name : "Glisser ou parcourir le fichier..."}
                            </span>
                            <input 
                                type="file" 
                                accept=".csv" 
                                onChange={handleCustomerFileChange} 
                                disabled={loading}
                                style={styles.fileInput}
                                id="customer-csv-input"
                            />
                            <label htmlFor="customer-csv-input" style={styles.fileLabelBlue}>
                                Sélectionner
                            </label>
                        </div>
                    </div>

                    {/* INPUT 3: Commandes */}
                    <div style={styles.inputCard}>
                        <div style={styles.inputCardHeader}>
                            <FileSpreadsheet size={18} style={{ color: '#e11d48' }} />
                            <span style={styles.inputCardTitle}>Fichier CSV des Commandes</span>
                        </div>
                        <p style={styles.inputCardDesc}>
                            Format requis : <code style={styles.code}>date, heure, client, achat, status</code>.
                        </p>
                        <div style={styles.fileDropZone}>
                            <UploadCloud size={24} style={styles.uploadIconRed} />
                            <span style={styles.dropText}>
                                {orderFile ? orderFile.name : "Glisser ou parcourir le fichier..."}
                            </span>
                            <input 
                                type="file" 
                                accept=".csv" 
                                onChange={handleOrderFileChange} 
                                disabled={loading}
                                style={styles.fileInput}
                                id="order-csv-input"
                            />
                            <label htmlFor="order-csv-input" style={styles.fileLabelRed}>
                                Sélectionner
                            </label>
                        </div>
                    </div>

                    {/* INPUT 4: ZIP Images */}
                    <div style={styles.inputCard}>
                        <div style={styles.inputCardHeader}>
                            <Image size={18} style={{ color: '#ec4899' }} />
                            <span style={styles.inputCardTitle}>Dossier ZIP des Images</span>
                        </div>
                        <p style={styles.inputCardDesc}>
                            ZIP contenant des images nommées d'après le SKU du produit (ex: <code style={styles.code}>sk-l.jpg</code>).
                        </p>
                        <div style={styles.fileDropZone}>
                            <UploadCloud size={24} style={styles.uploadIconPink} />
                            <span style={styles.dropText}>
                                {imageZipFile ? imageZipFile.name : "Glisser ou parcourir le fichier ZIP..."}
                            </span>
                            <input 
                                type="file" 
                                accept=".zip" 
                                onChange={handleImageZipFileChange} 
                                disabled={loading}
                                style={styles.fileInput}
                                id="image-zip-input"
                            />
                            <label htmlFor="image-zip-input" style={styles.fileLabelPink}>
                                Sélectionner
                            </label>
                        </div>
                    </div>

                </div>

                {/* Bouton Unique de Validation / Import */}
                <div style={styles.buttonWrapper}>
                    <button 
                        onClick={handleStartImports} 
                        disabled={loading || !hasSelectedFiles}
                        style={{
                            ...styles.mainImportBtn,
                            backgroundColor: loading ? '#cbd5e1' : (!hasSelectedFiles ? '#e2e8f0' : '#4f46e5'),
                            color: !hasSelectedFiles && !loading ? '#94a3b8' : '#ffffff',
                            cursor: loading || !hasSelectedFiles ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} style={styles.spin} />
                                <span>
                                    {currentStep === 'products' 
                                        ? 'Importation des produits...' 
                                        : (currentStep === 'customers' 
                                            ? 'Importation des clients...' 
                                            : (currentStep === 'orders' 
                                                ? 'Importation des commandes...'
                                                : 'Importation des images (ZIP)...'))}
                                </span>
                            </>
                        ) : (
                            <>
                                <PlayCircle size={20} />
                                <span>Lancer l'importation</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Zone de rapports / statistiques */}
            {(productReport || customerReport || orderReport) && (
                <div style={styles.reportsSection}>
                    <h3 style={styles.reportsSectionTitle}>Résultats de l'importation</h3>
                    
                    <div style={styles.reportsGrid}>
                        
                        {/* Rapport Produits */}
                        {productReport && (
                            <div style={{ ...styles.reportCard, borderLeft: '4px solid #a855f7' }}>
                                <div style={styles.reportCardHeader}>
                                    <ShoppingBag size={20} style={{ color: '#a855f7' }} />
                                    <h4 style={styles.reportCardTitle}>Rapport Produits</h4>
                                </div>
                                <div style={styles.reportStatGrid}>
                                    <div style={styles.reportItem}>
                                        <span style={styles.reportItemLabel}>Lignes</span>
                                        <span style={styles.reportItemVal}>{productReport.total}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#10b981' }}>
                                        <span style={styles.reportItemLabel}>Succès</span>
                                        <span style={styles.reportItemVal}>{productReport.successes}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#ef4444' }}>
                                        <span style={styles.reportItemLabel}>Échecs</span>
                                        <span style={styles.reportItemVal}>{productReport.errors}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rapport Clients */}
                        {customerReport && (
                            <div style={{ ...styles.reportCard, borderLeft: '4px solid #0ea5e9' }}>
                                <div style={styles.reportCardHeader}>
                                    <Users size={20} style={{ color: '#0ea5e9' }} />
                                    <h4 style={styles.reportCardTitle}>Rapport Clients</h4>
                                </div>
                                <div style={styles.reportStatGrid}>
                                    <div style={styles.reportItem}>
                                        <span style={styles.reportItemLabel}>Lignes</span>
                                        <span style={styles.reportItemVal}>{customerReport.total}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#10b981' }}>
                                        <span style={styles.reportItemLabel}>Créés</span>
                                        <span style={styles.reportItemVal}>{customerReport.successes}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#f59e0b' }}>
                                        <span style={styles.reportItemLabel}>Existants</span>
                                        <span style={styles.reportItemVal}>{customerReport.duplicates}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#ef4444' }}>
                                        <span style={styles.reportItemLabel}>Échecs</span>
                                        <span style={styles.reportItemVal}>{customerReport.errors}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rapport Commandes */}
                        {orderReport && (
                            <div style={{ ...styles.reportCard, borderLeft: '4px solid #e11d48' }}>
                                <div style={styles.reportCardHeader}>
                                    <FileSpreadsheet size={20} style={{ color: '#e11d48' }} />
                                    <h4 style={styles.reportCardTitle}>Rapport Commandes</h4>
                                </div>
                                <div style={styles.reportStatGrid}>
                                    <div style={styles.reportItem}>
                                        <span style={styles.reportItemLabel}>Lignes</span>
                                        <span style={styles.reportItemVal}>{orderReport.total}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#10b981' }}>
                                        <span style={styles.reportItemLabel}>Succès</span>
                                        <span style={styles.reportItemVal}>{orderReport.successes}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#ef4444' }}>
                                        <span style={styles.reportItemLabel}>Échecs</span>
                                        <span style={styles.reportItemVal}>{orderReport.errors}</span>
                                    </div>
                                </div>

                                {/* Liste des erreurs */}
                                {orderReport.errorDetails && orderReport.errorDetails.length > 0 && (
                                    <div style={styles.errorListContainer}>
                                        <span style={styles.errorListTitle}>Détails des erreurs :</span>
                                        <ul style={styles.errorList}>
                                            {orderReport.errorDetails.map((err, idx) => (
                                                <li key={idx} style={styles.errorListItem}>
                                                    {err}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rapport Images ZIP */}
                        {imageZipReport && (
                            <div style={{ ...styles.reportCard, borderLeft: '4px solid #ec4899' }}>
                                <div style={styles.reportCardHeader}>
                                    <Image size={20} style={{ color: '#ec4899' }} />
                                    <h4 style={styles.reportCardTitle}>Rapport Images</h4>
                                </div>
                                <div style={styles.reportStatGrid}>
                                    <div style={styles.reportItem}>
                                        <span style={styles.reportItemLabel}>Images</span>
                                        <span style={styles.reportItemVal}>{imageZipReport.total}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#10b981' }}>
                                        <span style={styles.reportItemLabel}>Succès</span>
                                        <span style={styles.reportItemVal}>{imageZipReport.successes}</span>
                                    </div>
                                    <div style={{ ...styles.reportItem, color: '#ef4444' }}>
                                        <span style={styles.reportItemLabel}>Échecs</span>
                                        <span style={styles.reportItemVal}>{imageZipReport.errors}</span>
                                    </div>
                                </div>

                                {/* Liste des erreurs d'images */}
                                {imageZipReport.details && imageZipReport.details.some(d => !d.success) && (
                                    <div style={styles.errorListContainer}>
                                        <span style={styles.errorListTitle}>Détails des échecs d'association :</span>
                                        <ul style={styles.errorList}>
                                            {imageZipReport.details.filter(d => !d.success).map((item, idx) => (
                                                <li key={idx} style={styles.errorListItem}>
                                                    Fichier "{item.fileName}" (SKU: {item.sku}) : {item.error || 'SKU introuvable ou erreur de chargement'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Info Footer */}
            <div style={styles.footerInfo}>
                <AlertCircle size={18} style={{ color: '#64748b' }} />
                <span>
                    Astuce : Ouvrez les outils de développement (F12) de votre navigateur et observez l'onglet <strong>Console</strong> pour un suivi détaillé de chaque ligne de CSV traitée en temps réel.
                </span>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '40px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
        color: '#1e293b',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
    },
    header: {
        marginBottom: '35px',
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '20px',
        transition: 'color 0.2s',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 12px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    titleIcon: {
        color: '#4f46e5',
    },
    subtitle: {
        fontSize: '15px',
        color: '#64748b',
        margin: 0,
        lineHeight: '1.6',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        marginBottom: '35px',
    },
    formTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '25px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '15px',
    },
    formSectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#0f172a',
    },
    inputsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        marginBottom: '30px',
    },
    inputCard: {
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
    },
    inputCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px',
    },
    inputCardTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#0f172a',
    },
    inputCardDesc: {
        fontSize: '13px',
        color: '#64748b',
        lineHeight: '1.5',
        margin: '0 0 16px 0',
    },
    fileDropZone: {
        border: '2px dashed #cbd5e1',
        borderRadius: '10px',
        padding: '20px 15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        position: 'relative',
        textAlign: 'center',
        minHeight: '140px',
    },
    uploadIcon: {
        color: '#c084fc',
        marginBottom: '10px',
    },
    uploadIconBlue: {
        color: '#38bdf8',
        marginBottom: '10px',
    },
    uploadIconRed: {
        color: '#f43f5e',
        marginBottom: '10px',
    },
    uploadIconPink: {
        color: '#f472b6',
        marginBottom: '10px',
    },
    dropText: {
        fontSize: '13px',
        color: '#475569',
        fontWeight: '500',
        marginBottom: '14px',
        wordBreak: 'break-all',
        padding: '0 10px',
    },
    fileInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: 0,
        cursor: 'pointer',
    },
    fileLabel: {
        padding: '6px 12px',
        backgroundColor: '#f3e8ff',
        color: '#9333ea',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        pointerEvents: 'none',
    },
    fileLabelBlue: {
        padding: '6px 12px',
        backgroundColor: '#e0f2fe',
        color: '#0284c7',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        pointerEvents: 'none',
    },
    fileLabelRed: {
        padding: '6px 12px',
        backgroundColor: '#ffe4e6',
        color: '#e11d48',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        pointerEvents: 'none',
    },
    fileLabelPink: {
        padding: '6px 12px',
        backgroundColor: '#fce7f3',
        color: '#db2777',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        pointerEvents: 'none',
    },
    errorListContainer: {
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #f1f5f9',
        textAlign: 'left',
    },
    errorListTitle: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#ef4444',
        display: 'block',
        marginBottom: '6px',
    },
    errorList: {
        margin: 0,
        paddingLeft: '18px',
        fontSize: '12px',
        color: '#dc2626',
    },
    errorListItem: {
        marginBottom: '4px',
        lineHeight: '1.4',
    },
    buttonWrapper: {
        display: 'flex',
        justifyContent: 'center',
    },
    mainImportBtn: {
        minWidth: '280px',
        padding: '14px 32px',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.2s',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
    },
    reportsSection: {
        marginBottom: '35px',
    },
    reportsSectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#0f172a',
        margin: '0 0 15px 0',
    },
    reportsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
    },
    reportCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 4px rgb(0 0 0 / 0.02)',
        border: '1px solid #e2e8f0',
    },
    reportCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px',
    },
    reportCardTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#0f172a',
        margin: 0,
    },
    reportStatGrid: {
        display: 'flex',
        gap: '12px',
    },
    reportItem: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '600',
        border: '1px solid #f1f5f9',
    },
    reportItemLabel: {
        fontSize: '10px',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    reportItemVal: {
        fontSize: '16px',
    },
    code: {
        fontFamily: "monospace",
        backgroundColor: '#e2e8f0',
        padding: '2px 4px',
        borderRadius: '4px',
        color: '#0f172a',
        fontSize: '12px',
    },
    footerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
        padding: '16px 20px',
        fontSize: '13px',
        color: '#475569',
        lineHeight: '1.5',
    },
    spin: {
        animation: 'spin 1s linear infinite',
    }
};

export default UnifiedImporter;
