import type { useToast as useNuxtToast } from '@nuxt/ui/composables';

type NuxtToast = ReturnType<typeof useNuxtToast>;
type AppToast = NuxtToast;

const addErrorToast = (toast: AppToast, title: string, description: string) => {
  toast.add({
    color: 'error',
    title,
    description,
    duration: 3000,
  });
};

const handleApiError = (error: unknown, toast: AppToast) => {
  if (error instanceof Error) {
    addErrorToast(toast, 'An error occurred', error.message);
  }
  else {
    addErrorToast(toast, 'Please review error logs for more information', 'An unknown error occurred');
    console.error('API Error:', error);
  }
};

const handleApiSuccess = (
  successMesage: string,
  toast: AppToast,
) => {
  toast.add({
    color: 'success',
    title: 'Success',
    description: successMesage,
    duration: 3000,
  });
};

export { handleApiError, handleApiSuccess };
