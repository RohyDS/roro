import axios from 'axios';

const SettingService = {
       reset: async () => {
           try {
               const response = await axios.post('http://localhost:5173/api/run-reset-bat'); 
               return response.data;
           } catch (error) {
               console.error(`Erreur:`, error);
               throw error;
           }
       }
   }
   export default SettingService;