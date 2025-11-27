// エラーハンドリング用カスタムフック

import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage, handleSupabaseError } from '@/lib/errorHandler';

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown, context: string) => {
    const appError = handleSupabaseError(error, context);
    const message = getUserFriendlyErrorMessage(error, context);

    toast({
      title: 'エラー',
      description: message,
      variant: 'destructive',
    });

    return appError;
  };

  const handleSuccess = (message: string) => {
    toast({
      title: '成功',
      description: message,
    });
  };

  return {
    handleError,
    handleSuccess,
  };
}
