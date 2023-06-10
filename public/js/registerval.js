// Email validation using regular expression
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function isPasswordValid(password) {
  // Dummy implementation, replace with your actual password validation logic
  return (
    password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  );
}

function validateForm(event) {
  // Reset error messages and borders

  document.getElementById('nameError').textContent = '';
  document.getElementById('fullName').classList.remove('error-border');
  document.getElementById('fullName').classList.remove('success-border');
  document.getElementById('emailError').textContent = '';
  document.getElementById('email').classList.remove('error-border');
  document.getElementById('email').classList.remove('success-border');

  document.getElementById('passwordError').textContent = '';
  document.getElementById('password').classList.remove('error-border');
  document.getElementById('password').classList.remove('success-border');

  // Get form values
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  const checkbox = document.getElementById('basic_checkbox_1');
  const checkError = document.getElementById('checkError');

  // name validation

  // Checkbox validation
  // Checkbox validation
  if (!checkbox.checked) {
    document.getElementById('checkError').textContent =
      'You must check the terms of services';
    checkError.classList.add('error-border');
    checkError.classList.remove('success-border');
  } else {
    checkError.classList.remove('error-border');
    checkError.classList.add('success-border');
  }
  // name validation
  if (fullName === '') {
    document.getElementById('nameError').textContent =
      'Please enter your full name';
    document.getElementById('name__error').classList.add('error-border');
  } else {
    document.getElementById('name__error').classList.add('success-border');
  }
  // Email validation
  if (!isValidEmail(email)) {
    document.getElementById('emailError').textContent =
      'Please enter a valid email address';
    document.getElementById('email__error').classList.add('error-border');
  } else {
    document.getElementById('email__error').classList.add('success-border');
  }
  //  Password Validation
  if (!password) {
    document.getElementById('passwordError').textContent =
      'Please enter a password';
    document.getElementById('password__error').classList.add('error-border');
  } else if (!isPasswordValid(password)) {
    document.getElementById('passwordError').textContent = 'Incorrect Password';
    document.getElementById('password__error').classList.add('error-border');
  } else {
    document.getElementById('password__error').classList.add('success-border');
  }

  const passwordConfirmValue = password;

  //  Password Validation
  if (!passwordConfirm) {
    document.getElementById('passwordConfirmError').textContent =
      'Please enter a confirm password';
    document.getElementById('password__c__error').classList.add('error-border');
  } else if (passwordConfirm !== password) {
    document.getElementById('passwordConfirmError').textContent =
      'Incorrect Password';
    document.getElementById('password__c__error').classList.add('error-border');
  } else {
    document
      .getElementById('password__c__error')
      .classList.add('success-border');
  }

  // Prevent form submission if there are errors
  if (
    !isValidEmail(email) ||
    !password ||
    !isPasswordValid(password) ||
    fullName === '' ||
    !checkbox.checked ||
    passwordConfirm !== password
  ) {
    event.preventDefault();
  }
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.querySelector('.password-toggle');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    passwordToggle.classList.remove('fa-eye-slash');
    passwordToggle.classList.add('fa-eye');
  } else {
    passwordInput.type = 'password';
    passwordToggle.classList.remove('fa-eye');
    passwordToggle.classList.add('fa-eye-slash');
  }
}

function togglePasswordVisibilityX() {
  const passwordInputX = document.getElementById('passwordConfirm');
  const passwordToggleX = document.querySelector('.passwordConfirm-toggle');

  if (passwordInputX.type === 'password') {
    passwordInputX.type = 'text';
    passwordToggleX.classList.remove('fa-eye-slash');
    passwordToggleX.classList.add('fa-eye');
  } else {
    passwordInputX.type = 'password';
    passwordToggleX.classList.remove('fa-eye');
    passwordToggleX.classList.add('fa-eye-slash');
  }
}

// Add event listeners to input fields
document.getElementById('email').addEventListener('focus', function () {
  this.classList.remove('error-border');
  this.classList.remove('success-border');
});

document.getElementById('password').addEventListener('focus', function () {
  this.classList.remove('error-border');
  this.classList.remove('success-border');
});
