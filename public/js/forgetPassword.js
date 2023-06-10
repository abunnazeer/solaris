import axios from 'axios';
import { showAlert } from './alert';
export const forgetPassword = async email => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/forget-password',
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Please Check your email for password reset link');
      window.setTimeout(() => {
        location.assign('/user/login');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data);
  }
};
