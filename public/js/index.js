import '@babel/polyfill';
import { login, logout } from './login';
import { register } from './register';

const loginForm = document.querySelector('.form');
const logoutForm = document.querySelector('.logout');
const registerForm = document.querySelector('.rform');

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutForm) logoutForm.addEventListener('click', logout);

//  registration

if (registerForm)
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const fullName = document.getElementById('fullName').value;
    register(email, password, passwordConfirm, fullName);
  });
