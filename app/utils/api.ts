import type { useToast as useNuxtToast } from '@nuxt/ui/composables';
import type { ToastServiceMethods } from 'primevue/toastservice';

type NuxtToast = ReturnType<typeof useNuxtToast>;
type AppToast = NuxtToast | ToastServiceMethods;

const isNuxtToast = (toast: AppToast): toast is NuxtToast => 'toasts' in toast;

const addErrorToast = (toast: AppToast, title: string, description: string) => {
  if (isNuxtToast(toast)) {
    toast.add({
      color: 'error',
      title,
      description,
      duration: 3000,
    });
    return;
  }

  toast.add({
    severity: 'error',
    summary: title,
    detail: description,
    life: 3000,
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
  if (isNuxtToast(toast)) {
    toast.add({
      color: 'success',
      title: 'Success',
      description: successMesage,
      duration: 3000,
    });
    return;
  }

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: successMesage,
    life: 3000,
  });
};

export { handleApiError, handleApiSuccess };
