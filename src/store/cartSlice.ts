import { Cart, CartItem, Product } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Helper functions
const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const discountedPrice =
      item.product.price * (1 - item.product.discountPercentage / 100);
    return total + discountedPrice * item.quantity;
  }, 0);
};

const updateCartTotals = (state: Cart) => {
  state.totalItems = calculateTotalItems(state.items);
  state.totalPrice = calculateTotalPrice(state.items);
};

// Load cart from localStorage
const loadCartFromStorage = (): Cart => {
  if (typeof window !== 'undefined') {
    try {
      const serializedCart = localStorage.getItem('nextshop-cart');
      if (serializedCart) {
        const cart = JSON.parse(serializedCart);
        // Recalculate totals in case of data inconsistency
        cart.totalItems = calculateTotalItems(cart.items);
        cart.totalPrice = calculateTotalPrice(cart.items);
        return cart;
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }
  return initialState;
};

// Save cart to localStorage
const saveCartToStorage = (cart: Cart) => {
  if (typeof window !== 'undefined') {
    try {
      const serializedCart = JSON.stringify(cart);
      localStorage.setItem('nextshop-cart', serializedCart);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
};

// Create the cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;

      // Check if product already exists in cart
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Update quantity if product already exists
        existingItem.quantity += quantity;
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: uuidv4(),
          product,
          quantity,
        };
        state.items.push(newItem);
      }

      updateCartTotals(state);
      saveCartToStorage(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      updateCartTotals(state);
      saveCartToStorage(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>
    ) => {
      const { itemId, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        state.items = state.items.filter((item) => item.id !== itemId);
      } else {
        const item = state.items.find((item) => item.id === itemId);
        if (item) {
          item.quantity = quantity;
        }
      }

      updateCartTotals(state);
      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      saveCartToStorage(state);
    },

    // For hydrating cart on app initialization
    hydrateCart: (state) => {
      const cartFromStorage = loadCartFromStorage();
      state.items = cartFromStorage.items;
      state.totalItems = cartFromStorage.totalItems;
      state.totalPrice = cartFromStorage.totalPrice;
    },

    // Update product data in cart (useful when product details change)
    updateProductInCart: (state, action: PayloadAction<Product>) => {
      const updatedProduct = action.payload;
      const item = state.items.find(
        (item) => item.product.id === updatedProduct.id
      );

      if (item) {
        item.product = updatedProduct;
        updateCartTotals(state);
        saveCartToStorage(state);
      }
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  hydrateCart,
  updateProductInCart,
} = cartSlice.actions;

// Export selectors
export const selectCart = (state: { cart: Cart }) => state.cart;
export const selectCartItems = (state: { cart: Cart }) => state.cart.items;
export const selectCartTotalItems = (state: { cart: Cart }) =>
  state.cart.totalItems;
export const selectCartTotalPrice = (state: { cart: Cart }) =>
  state.cart.totalPrice;
export const selectCartItemById = (itemId: string) => (state: { cart: Cart }) =>
  state.cart.items.find((item) => item.id === itemId);
export const selectProductInCart =
  (productId: number) => (state: { cart: Cart }) =>
    state.cart.items.find((item) => item.product.id === productId);

// Export reducer
export default cartSlice.reducer;
