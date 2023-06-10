import '@babel/polyfill';
import { forgetPassword } from './forgetPassword';
import { resetPassword } from './resetPassword';
import { login, logout } from './login';
import { register } from './register';

const loginForm = document.querySelector('.form');
const logoutForm = document.querySelector('.logout');
const registerForm = document.querySelector('.rform');
const forgetPasswordForm = document.querySelector('.forget_password');
const resetPasswordForm = document.querySelector('.reset_password');

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

// forget password
if (forgetPasswordForm)
  forgetPasswordForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    forgetPassword(email);
  });

//  Reset Password

if (resetPasswordForm)
  resetPasswordForm.addEventListener('submit', e => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    resetPassword(password, passwordConfirm);
  });
