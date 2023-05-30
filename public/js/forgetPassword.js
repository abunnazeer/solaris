const login = async email => {
  try {
    const rest = await axios({
      method: 'POST',
      url: 'http://localhost:8000/forget-password',
      data: {
        email,
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

  login(email);
});
