import React, { ReactNode, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';

interface ReactTableQueryClientProviderProps {
    children: ReactNode;
}

// Component to check if QueryClient exists and provide one if not
const ReactTableQueryClientProvider: React.FC<ReactTableQueryClientProviderProps> = ({
    children,
}) => {
    // Create a default QueryClient for the table
    const defaultQueryClient = useMemo(() => {
        return new QueryClient({
            defaultOptions: {
                queries: {
                    // Disable automatic retries for polling queries
                    retry: false,
                    // Don't refetch on window focus for polling queries
                    refetchOnWindowFocus: false,
                    // Don't refetch on reconnect for polling queries
                    refetchOnReconnect: false,
                    // Set default stale time for polling
                    staleTime: 0,
                    // Set default garbage collection time
                    gcTime: 5 * 60 * 1000, // 5 minutes
                },
            },
        });
    }, []);

    return <QueryClientProvider client={defaultQueryClient}>{children}</QueryClientProvider>;
};

// Component to conditionally wrap with QueryClient
const ConditionalQueryClientProvider: React.FC<ReactTableQueryClientProviderProps> = ({
    children,
}) => {
    // Check if we're already inside a QueryClient context
    const CheckForExistingClient: React.FC<{ children: ReactNode }> = ({ children }) => {
        try {
            useQueryClient();
            // If we get here, a QueryClient already exists
            return <>{children}</>;
        } catch (error) {
            // No QueryClient exists, we need to provide one
            return <ReactTableQueryClientProvider>{children}</ReactTableQueryClientProvider>;
        }
    };

    return <CheckForExistingClient>{children}</CheckForExistingClient>;
};

export default ConditionalQueryClientProvider;
