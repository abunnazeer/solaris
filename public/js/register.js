const register = async (email, password, passwordConfirm, fullName) => {
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
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  const fullName = document.getElementById('fullName').value;
  register(email, password, passwordConfirm, fullName);
});
