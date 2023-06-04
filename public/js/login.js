import axios from 'axios';
import { showAlert } from './alert';
// const errmsg = document.querySelector('.mee').value;
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://app.solarisfinance.com/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'login successful');
      window.setTimeout(() => {
        location.assign('/dashboard');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Incorrect login details');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://app.solarisfinance.com/user/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log('no connection');
  }
};
