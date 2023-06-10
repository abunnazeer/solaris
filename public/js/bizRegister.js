const register = async (email, password, passwordConfirm, fullName, role) => {
  try {
    const rest = await axios({
      method: 'POST',
      url: 'http://localhost/register',
      data: {
        email,
        password,
        passwordConfirm,
        fullName,
        role,
      },
    });
    console.log(rest);
  } catch (err) {
    console.log(err.response.data);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  const fullName = document.getElementById('fullName').value;
  const role = document.getElementById('role').value;
  register(email, password, passwordConfirm, fullName, role);
});
