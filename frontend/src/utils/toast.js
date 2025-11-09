import toast from 'react-hot-toast';

// Custom toast styles to match your theme
const toastStyles = {
  duration: 4000,
  position: 'top-center',
  style: {
    background: '#333',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    maxWidth: '400px',
  },
  success: {
    iconTheme: {
      primary: '#4ade80',
      secondary: '#ffffff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff',
    },
  },
  loading: {
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#ffffff',
    },
  },
};

// Success toast
export const showSuccess = (message) => {
  toast.success(message, {
    ...toastStyles,
    style: {
      ...toastStyles.style,
      background: '#10b981',
    },
  });
};

// Error toast
export const showError = (message) => {
  toast.error(message, {
    ...toastStyles,
    style: {
      ...toastStyles.style,
      background: '#ef4444',
    },
  });
};

// Warning toast
export const showWarning = (message) => {
  toast(message, {
    ...toastStyles,
    icon: '⚠️',
    style: {
      ...toastStyles.style,
      background: '#f59e0b',
    },
  });
};

// Info toast
export const showInfo = (message) => {
  toast(message, {
    ...toastStyles,
    icon: 'ℹ️',
    style: {
      ...toastStyles.style,
      background: '#3b82f6',
    },
  });
};

// Loading toast
export const showLoading = (message) => {
  return toast.loading(message, {
    ...toastStyles,
    style: {
      ...toastStyles.style,
      background: '#6b7280',
    },
  });
};

// Dismiss specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAll = () => {
  toast.dismiss();
};

// Promise toast - automatically handles success/error
export const showPromiseToast = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong!',
    },
    toastStyles
  );
};

export default toast;