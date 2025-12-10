import { createUser, getMe, getUserPreferences } from "@/api/userService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCurrentUser() {
    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: getMe,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user']})
        }
    })
}

export function useUserPreferences(userId?: string) {
    return useQuery({
        queryKey: ['userPreferences', userId],
        queryFn: () => getUserPreferences({ userId: userId! }),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}