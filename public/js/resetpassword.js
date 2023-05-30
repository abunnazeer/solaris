const login = async (password, passwordConfirm) => {
  try {
    const rest = await axios({
      method: 'GET',
      url: 'http://localhost:8000/reset-password/:token',
      data: {
        password,
        passwordConfirm,
      },
    });
    console.log(rest);
  } catch (err) {
    console.log(err.response.data);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  login(password, passwordConfirm);
});
