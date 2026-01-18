import { useToastContext } from '../contexts/useToastContext';

export function useToast() {
  return useToastContext();
}
