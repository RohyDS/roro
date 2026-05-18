import api from '../../config/api';

const CartService = {
    /**
     * 1. Vider le panier du client sur l'API Bagisto
     */
    clearCart: async () => {
        try {
            const response = await api.delete('v1/customer/cart/remove');
            return response.data;
        } catch (error) {
            console.warn("Erreur CartService.clearCart (panier potentiellement déjà vide):", error.message);
            return null;
        }
    },

    /**
     * 2. Ajouter un produit au panier
     */
    addToCart: async (productId, quantity) => {
        try {
            const response = await api.post(`v1/customer/cart/add/${productId}`, {
                product_id: productId,
                quantity: quantity
            });
            return response.data;
        } catch (error) {
            console.error(`Erreur CartService.addToCart (ID: ${productId}):`, error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * 3. Sauvegarder l'adresse de livraison et facturation
     */
    saveAddress: async (addressData) => {
        try {
            const addressPayload = {
                billing: {
                    first_name:       addressData.first_name,
                    last_name:        addressData.last_name,
                    email:            addressData.email,
                    address:          [addressData.address1 || addressData.address || "Adresse par défaut"],
                    city:             addressData.city,
                    state:            addressData.state || "IDF",
                    country:          addressData.country || "FR",
                    postcode:         addressData.postcode,
                    phone:            addressData.phone,
                    use_for_shipping: true
                },
                shipping: {
                    first_name:       addressData.first_name,
                    last_name:        addressData.last_name,
                    email:            addressData.email,
                    address:          [addressData.address1 || addressData.address || "Adresse par défaut"],
                    city:             addressData.city,
                    state:            addressData.state || "IDF",
                    country:          addressData.country || "FR",
                    postcode:         addressData.postcode,
                    phone:            addressData.phone
                }
            };
            const response = await api.post('v1/customer/checkout/save-address', addressPayload);
            return response.data;
        } catch (error) {
            console.error("Erreur CartService.saveAddress:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * 4. Enregistrer le mode d'expédition
     */
    saveShipping: async (shippingMethod) => {
        try {
            const response = await api.post('v1/customer/checkout/save-shipping', {
                shipping_method: shippingMethod
            });
            return response.data;
        } catch (error) {
            console.error("Erreur CartService.saveShipping:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * 5. Enregistrer le mode de paiement
     */
    savePayment: async (paymentMethod = 'cashondelivery') => {
        try {
            const response = await api.post('v1/customer/checkout/save-payment', {
                payment: {
                    method: paymentMethod
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur CartService.savePayment:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * 6. Finaliser la commande (création finale de l'order)
     */
    saveOrder: async () => {
        try {
            const response = await api.post('v1/customer/checkout/save-order');
            return response.data;
        } catch (error) {
            console.error("Erreur CartService.saveOrder:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Pipeline global pour automatiser tout le flux d'achat de A à Z.
     * Suit scrupuleusement les étapes de cvdor.text.
     */
    processCheckout: async (cartItems, addressData) => {
        console.log("%c--- DÉBUT FLOW COMMANDE API BAGISTO ---", "color:#10b981; font-weight:bold;");

        // Étape 1 : Vider d'abord le panier API pour partir sur un état propre
        console.log("  [1/6] Nettoyage du panier existant...");
        await CartService.clearCart();

        // Étape 2 : Ajouter chaque produit du panier local vers le panier API
        console.log("  [2/6] Synchronisation et ajout des produits...");
        for (const item of cartItems) {
            const productId = item.id;
            const qty = item.quantity || 1;
            console.log(`        -> Produit ID ${productId} | Quantité: ${qty}`);
            await CartService.addToCart(productId, qty);
        }

        // Étape 3 : Enregistrer l'adresse
        console.log("  [3/6] Enregistrement de l'adresse de livraison...");
        const resAddress = await CartService.saveAddress(addressData);

        // Résoudre dynamiquement le mode de livraison retourné par l'API
        let selectedShippingMethod = 'free_free';
        const rates = resAddress?.data?.rates || [];
        if (rates.length > 0 && rates[0].rates && rates[0].rates.length > 0) {
            selectedShippingMethod = rates[0].rates[0].method || rates[0].rates[0].code || 'free_free';
        }
        console.log(`        -> Mode de livraison sélectionné : "${selectedShippingMethod}"`);

        // Étape 4 : Enregistrer le mode d'expédition
        console.log("  [4/6] Enregistrement du mode de livraison...");
        await CartService.saveShipping(selectedShippingMethod);

        // Étape 5 : Enregistrer le mode de paiement (Cash on Delivery)
        console.log("  [5/6] Enregistrement du mode de paiement...");
        await CartService.savePayment('cashondelivery');

        // Étape 6 : Validation finale et conversion en Order
        console.log("  [6/6] Validation finale de la commande (Checkout)...");
        const resOrder = await CartService.saveOrder();

        console.log("%c--- COMMANDÉ AVEC SUCCÈS SUR BAGISTO ! ---", "color:#10b981; font-weight:bold;");
        return resOrder;
    }
};

export default CartService;
