import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../services/authService';

export const useCurrentUser = () => {
  return useQuery(['currentUser'], fetchCurrentUser, {
    retry: false, // Don't retry on failure
    refetchOnWindowFocus: false,
  });
};
