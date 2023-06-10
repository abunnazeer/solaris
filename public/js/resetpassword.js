import axios from 'axios';
import { showAlert } from './alert';

export const resetPassword = async (password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:8000/reset-password/:token',
      data: {
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'You have successfully reset your password');
      window.setTimeout(() => {
        location.assign('/user/login');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data);
  }
};
