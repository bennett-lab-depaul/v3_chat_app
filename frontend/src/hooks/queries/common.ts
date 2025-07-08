import   toast       from "react-hot-toast";
import { useEffect } from "react";
import { useQuery  } from "@tanstack/react-query";

// Common parameters
export const DEFAULT_STALE = 1000 * 60 * 5; // Cache cleared 5 min after component unloads

// --------------------------------------------------------------------
// "GET" query wrapper function that can be used for all types
// --------------------------------------------------------------------
interface ModelQueryOptions<T> {
    queryKey   : string;            // ["goal"] / ["chatSessions"]
    queryFn    : () => Promise<T>;  // fetcher that returns T
    empty?     : T;                 // default fallback
    staleTime? : number;            // override
}

export function useModelQuery<T>({queryKey, queryFn, empty, staleTime=DEFAULT_STALE}: ModelQueryOptions<T>) {
    // TanStack Query
    const query = useQuery<T, Error>({
        queryKey : [queryKey], // Cache key
        queryFn  : queryFn,    // Returns Promise<T>
        staleTime: staleTime,  // Cache cleared X ms after component unloads
        refetchOnWindowFocus: true,
    });

    // Error handling
    useEffect(() => {
        if (query.isError) toast.error(query.error.message);
    }, [query.isError, query.error]);

    // Return
    return {...query, data: query.data ?? empty,};
}
