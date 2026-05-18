import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem('orders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    const [customCategories, setCustomCategories] = useState(() => {
        const savedCategories = localStorage.getItem('custom_categories');
        return savedCategories ? JSON.parse(savedCategories) : [];
    });

    const [wishlist, setWishlist] = useState(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem('custom_categories', JSON.stringify(customCategories));
    }, [customCategories]);

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToCart = (product, quantity) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const clearAllData = () => {
        setCart([]);
        setOrders([]);
        setCustomCategories([]);
        setWishlist([]);
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        localStorage.removeItem('custom_categories');
        localStorage.removeItem('wishlist');
    };

    const addCategory = (categoryData) => {
        const newCategory = {
            id: `CAT-${Date.now()}`,
            ...categoryData
        };
        setCustomCategories(prev => [newCategory, ...prev]);
        return newCategory;
    };

    const deleteCategory = (categoryId) => {
        setCustomCategories(prev => prev.filter(c => c.id !== categoryId));
    };

    const addOrder = (orderData) => {
        const newOrder = {
            id: `ORD-${Date.now()}`,
            date: new Date().toISOString(),
            status: 'En attente',
            ...orderData
        };
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        return newOrder;
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price || item.min_price || 0);
            return total + price * item.quantity;
        }, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // --- Gestion de la Wishlist ---

    const toggleWishlistItem = (product) => {
        setWishlist(prevWishlist => {
            const exists = prevWishlist.find(item => item.id === product.id);
            if (exists) {
                return prevWishlist.filter(item => item.id !== product.id);
            }
            return [...prevWishlist, product];
        });
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    return (
        <CartContext.Provider value={{
            cart,
            orders,
            customCategories,
            wishlist,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            clearAllData,
            addOrder,
            addCategory,
            deleteCategory,
            getCartTotal,
            getCartCount,
            toggleWishlistItem,
            isInWishlist,
            clearWishlist,
            setWishlist
        }}>
            {children}
        </CartContext.Provider>
    );
};
