import axios from 'axios';
import { showAlert } from './alert';
// const errmsg = document.querySelector('.fs');
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/login',
      data: {
        email,
        password,
      },
    });

    const isActive = res.data.data.user.isActive;
    const isAdmin = res.data.data.user.role;
    if (
      (res.data.status === 'success' && isActive == true) ||
      isAdmin === 'admin'
    ) {
      showAlert('success', 'login successful');
      window.setTimeout(() => {
        location.assign('/dashboard');
      }, 1500);
    } else {
      window.setTimeout(() => {
        location.assign('/user/activation');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data);
  }
  console.log();
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8000/user/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log('no connection');
  }
};
