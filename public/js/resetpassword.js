const login = async (password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://app.solarisfinance.com/reset-password/:id',
      data: {
        password,
        passwordConfirm,
      },

      // params: {
      //   token: 'token',
      // },
    });
    if (res.data.status === 'success') {
      console.log('login successful');
      window.setTimeout(() => {
        location.assign('/activation');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  login(password, passwordConfirm);
});
