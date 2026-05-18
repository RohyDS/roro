import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process' // Importation nécessaire pour exécuter le .bat

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'execute-bat-plugin',
      configureServer(server) {
        // Crée un point d'accès direct sur le serveur de développement Vite
        server.middlewares.use('/api/run-reset-bat', (req, res, next) => {
          if (req.method === 'POST') {
            console.log("Démarrage de la réinitialisation de Bagisto via le terminal Vite...");

            // Chemin absolu vers votre fichier .bat
            const batPath = '"reset.bat"';

            // Exécution du fichier .bat sur votre machine
            exec(batPath, (error, stdout, stderr) => {
              res.setHeader('Content-Type', 'application/json');
              
              if (error) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: error.message }));
              }
              
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, message: "Base réinitialisée !" }));
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})