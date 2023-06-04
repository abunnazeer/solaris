import axios from 'axios';
import { showAlert } from './alert';
export const register = async (email, password, passwordConfirm, fullName) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/register',
      data: {
        email,
        password,
        passwordConfirm,
        fullName,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Registration successful');
      window.setTimeout(() => {
        location.assign('/activation');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
