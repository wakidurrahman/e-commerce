import {
  addToCart as addToCartAction,
  clearCart as clearCartAction,
  hydrateCart,
  removeFromCart as removeFromCartAction,
  selectCart,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalPrice,
  selectProductInCart,
  updateQuantity as updateQuantityAction,
} from '@/store/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Product, UseCartReturn } from '@/types';
import { useCallback, useEffect } from 'react';

export const useCart = (): UseCartReturn => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const cartItems = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectCartTotalItems);
  const totalPrice = useAppSelector(selectCartTotalPrice);

  // Hydrate cart from localStorage on component mount
  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  // Add item to cart
  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      if (quantity <= 0) {
        console.warn('Quantity must be greater than 0');
        return;
      }

      if (product.stock < quantity) {
        console.warn('Not enough stock available');
        return;
      }

      dispatch(addToCartAction({ product, quantity }));
    },
    [dispatch]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    (itemId: string) => {
      dispatch(removeFromCartAction(itemId));
    },
    [dispatch]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 0) {
        console.warn('Quantity cannot be negative');
        return;
      }

      dispatch(updateQuantityAction({ itemId, quantity }));
    },
    [dispatch]
  );

  // Clear entire cart
  const clearCart = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  // Get total price (already calculated in store, but provided for consistency)
  const getTotalPrice = useCallback(() => {
    return totalPrice;
  }, [totalPrice]);

  // Get total items (already calculated in store, but provided for consistency)
  const getTotalItems = useCallback(() => {
    return totalItems;
  }, [totalItems]);

  // Check if product is in cart
  const isProductInCart = useCallback(
    (productId: number) => {
      return cartItems.some((item) => item.product.id === productId);
    },
    [cartItems]
  );

  // Get product quantity in cart
  const getProductQuantity = useCallback(
    (productId: number) => {
      const item = cartItems.find((item) => item.product.id === productId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  // Get cart item by product ID
  const getCartItemByProductId = useCallback(
    (productId: number) => {
      return cartItems.find((item) => item.product.id === productId);
    },
    [cartItems]
  );

  // Add to cart or update quantity if already exists
  const addOrUpdateCart = useCallback(
    (product: Product, quantity: number = 1) => {
      const existingItem = getCartItemByProductId(product.id);

      if (existingItem) {
        updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        addToCart(product, quantity);
      }
    },
    [addToCart, updateQuantity, getCartItemByProductId]
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    // Additional helper methods
    isProductInCart,
    getProductQuantity,
    getCartItemByProductId,
    addOrUpdateCart,
  };
};

// Hook for checking if a specific product is in cart
export const useProductInCart = (productId: number) => {
  const productInCart = useAppSelector((state) =>
    selectProductInCart(productId)(state)
  );

  return {
    isInCart: !!productInCart,
    cartItem: productInCart,
    quantity: productInCart?.quantity || 0,
  };
};
