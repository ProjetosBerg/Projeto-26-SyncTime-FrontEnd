import { QueryClient } from '@tanstack/react-query';

const ONE_MINUTE = 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_MINUTE,
      gcTime: 5 * ONE_MINUTE,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 0
    }
  }
});

export default queryClient;
