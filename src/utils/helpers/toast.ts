import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },

  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  loading: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Loading',
      text2: message,
      position: 'top',
      autoHide: false,
    });
  },

  hide: () => {
    Toast.hide();
  },
};
