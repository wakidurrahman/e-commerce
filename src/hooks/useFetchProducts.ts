import { productApi } from '@/services/api';
import { PaginationParams, Product, UseFetchProductsReturn } from '@/types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

interface UseFetchProductsProps {
  params?: PaginationParams;
  enabled?: boolean;
  infinite?: boolean;
}

export const useFetchProducts = ({
  params = {},
  enabled = true,
  infinite = false,
}: UseFetchProductsProps = {}): UseFetchProductsReturn => {
  // For infinite scroll pagination
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      productApi.getProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / (params.limit || 20));
      const currentPage = allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && infinite,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // For regular pagination
  const regularQuery = useQuery({
    queryKey: ['products', 'paginated', params],
    queryFn: () => productApi.getProducts(params),
    enabled: enabled && !infinite,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (infinite) {
    // Handle infinite query results
    const products: Product[] =
      infiniteQuery.data?.pages.flatMap((page) => page.products) || [];

    return {
      products,
      isLoading: infiniteQuery.isLoading,
      error: infiniteQuery.error?.message || null,
      hasNextPage: infiniteQuery.hasNextPage || false,
      fetchNextPage: () => {
        if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
          infiniteQuery.fetchNextPage();
        }
      },
      refetch: () => infiniteQuery.refetch(),
    };
  } else {
    // Handle regular query results
    return {
      products: regularQuery.data?.products || [],
      isLoading: regularQuery.isLoading,
      error: regularQuery.error?.message || null,
      hasNextPage: false, // Not applicable for regular pagination
      fetchNextPage: () => {
        console.warn('fetchNextPage is only available with infinite scroll');
      },
      refetch: () => regularQuery.refetch(),
    };
  }
};

// Hook for fetching product categories
export const useFetchCategories = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
// Hook for fetching product categories
export const useFetchProductsList = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['productsList'],
    queryFn: productApi.getProductsList,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for searching products
export const useSearchProducts = (
  query: string,
  params: Omit<PaginationParams, 'search'> = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['products', 'search', query, params],
    queryFn: () => productApi.searchProducts(query, params),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes (search results can change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching products by category
export const useFetchProductsByCategory = (
  category: string,
  params: Omit<PaginationParams, 'category'> = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['products', 'category', category, params],
    queryFn: () => productApi.getProductsByCategory(category, params),
    enabled: enabled && category.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
