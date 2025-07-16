import { productApi } from '@/services/api';
import { UseProductDetailsReturn } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface UseProductDetailsProps {
  id: number;
  enabled?: boolean;
}

export const useProductDetails = ({
  id,
  enabled = true,
}: UseProductDetailsProps): UseProductDetailsReturn => {
  const query = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes (product details don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 error (product not found)
      if (error?.message?.includes('not found')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });

  return {
    product: query.data || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: () => query.refetch(),
  };
};

// Alternative hook for multiple product details
export const useMultipleProductDetails = (
  ids: number[],
  enabled: boolean = true
) => {
  const queries = useQuery({
    queryKey: ['products', 'multiple', ids],
    queryFn: async () => {
      const products = await Promise.all(
        ids.map((id) => productApi.getProductById(id))
      );
      return products;
    },
    enabled: enabled && ids.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    products: queries.data || [],
    isLoading: queries.isLoading,
    error: queries.error?.message || null,
    refetch: () => queries.refetch(),
  };
};
