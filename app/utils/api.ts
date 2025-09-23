import type { ToastServiceMethods } from 'primevue/toastservice';

const handleApiError = (error: unknown, toast: ToastServiceMethods) => {
  if (error instanceof Error) {
    toast.add({
      severity: 'error',
      summary: 'An error occurred',
      detail: error.message,
      life: 3000,
    });
  }
  else {
    toast.add({
      severity: 'error',
      detail: 'An unknown error occurred',
      summary: 'Please review error logs for more information',
      life: 3000,
    });
    console.error('API Error:', error);
  }
};

const handleApiSuccess = (
  successMesage: string,
  toast: ToastServiceMethods,
) => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: successMesage,
    life: 3000,
  });
};

export { handleApiError, handleApiSuccess };
