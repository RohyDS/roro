@echo off
echo --------------------------------------------------
echo Reinitialisation de la base de donnees Bagisto...
echo --------------------------------------------------

:: Déplacement vers le dossier de votre projet Bagisto
cd /d "..\my-bagisto-store"

:: Nettoyage préalable des caches pour éviter les blocages passés
call php artisan config:clear
call php artisan route:clear
call php artisan cache:clear

:: Forcer la réinitialisation et le peuplement des données
call php artisan migrate:fresh --seed

:: Création automatique du fichier 'installed' pour éviter l'erreur de route CLI
if not exist "storage\installed" (
    type nul > "storage\installed"
)

echo --------------------------------------------------
echo Base de donnees Bagisto réinitialisee avec succes !
echo --------------------------------------------------