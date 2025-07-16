# �� State Management

Practical state management patterns for e-commerce applications using Redux Toolkit, React Query, and local state.

## 🎯 State Categories

### 1. Server State (React Query)

- Product data from APIs
- User profiles and authentication
- Order history and tracking
- Real-time inventory levels

### 2. Client State (Redux Toolkit)

- Shopping cart contents
- User preferences and settings
- UI state (sidebar, modals)
- Filter and search parameters

### 3. Local State (useState/useReducer)

- Form inputs and validation
- Component-specific UI state
- Temporary data and interactions

## 🏗️ Architecture Overview

**Separation of Concerns:**

- **React Query:** API data with automatic caching and synchronization
- **Redux Toolkit:** Global client state with persistence
- **Local State:** Component-specific state that doesn't need sharing

## 🔄 Redux Toolkit Implementation

### 1. Cart Slice (Essential)

```typescript
// store/cartSlice.ts
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [] as CartItem[],
    total: 0,
  },
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity: number }>
    ) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...product, quantity });
      }

      // Recalculate total
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
  },
});
```

### 2. State Persistence

```typescript
// store/index.ts
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'nextshop',
  storage,
  whitelist: ['cart', 'userPreferences'], // Only persist specific slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
```

### 3. Memoized Selectors

```typescript
// store/selectors.ts
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) => state.cart.total;
export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0)
);
```

## ⚡ React Query for Server State

### 1. Product Queries

```typescript
// hooks/useProducts.ts
export const useProducts = (params: ProductParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 2. Optimistic Updates

```typescript
// hooks/useCart.ts
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCartAPI,
    onMutate: async (newItem) => {
      // Optimistic update
      await queryClient.cancelQueries(['cart']);
      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old: CartItem[]) => [
        ...old,
        newItem,
      ]);

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(['cart'], context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });
};
```

## 🎨 Custom Hooks for State Logic

### 1. Form State Hook

```typescript
// hooks/useForm.ts
export const useForm = <T>(
  initialValues: T,
  validation?: (values: T) => Record<string, string>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      if (validation) {
        const newErrors = validation({ ...values, [name]: value });
        setErrors(newErrors);
      }
    },
    [values, validation]
  );

  const handleBlur = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  return { values, errors, touched, handleChange, handleBlur };
};
```

### 2. Local Storage Sync

```typescript
// hooks/useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};
```

## 🔄 State Synchronization

### 1. Cross-Tab Sync

```typescript
// hooks/useCrossTabSync.ts
export const useCrossTabSync = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'persist:nextshop' && e.newValue) {
        // Sync Redux state across tabs
        const newState = JSON.parse(e.newValue);
        dispatch(syncStateFromStorage(newState));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);
};
```

## 🎯 Best Practices Summary

### Do's ✅

1. **Separate server and client state** clearly
2. **Use memoized selectors** for computed values
3. **Implement optimistic updates** for better UX
4. **Persist critical state** (cart, preferences)
5. **Use local state** for component-specific UI
6. **Validate data** before persistence
7. **Handle offline scenarios** gracefully

### Don'ts ❌

1. **Don't put everything in global state**
2. **Don't ignore performance** implications
3. **Don't store derived data** in state
4. **Don't forget cleanup** in useEffect
5. **Don't ignore state normalization** for complex data
6. **Don't synchronize unnecessarily**

## 📋 Implementation Checklist

- [ ] **Redux Store:** Configured with Redux Toolkit
- [ ] **Cart State:** Persistent with localStorage
- [ ] **React Query:** Setup for server state management
- [ ] **Selectors:** Memoized for performance
- [ ] **Custom Hooks:** Created for reusable state logic
- [ ] **Optimistic Updates:** Implemented for user actions
- [ ] **Error Handling:** Proper error states and boundaries
- [ ] **Cross-Tab Sync:** Cart state synchronized across tabs
- [ ] **Loading States:** Managed for all async operations
- [ ] **Form Validation:** Real-time with proper error display

State management should be predictable, performant, and maintainable. Start simple and add complexity only when needed.
