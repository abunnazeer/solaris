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
  document.getElementById('emailError').textContent = '';
  document.getElementById('email').classList.remove('error-border');
  document.getElementById('email').classList.remove('success-border');
  document.getElementById('passwordError').textContent = '';
  document.getElementById('password').classList.remove('error-border');
  document.getElementById('password').classList.remove('success-border');

  // Get form values
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validate email
  if (!isValidEmail(email)) {
    document.getElementById('emailError').textContent =
      'Please enter a valid email address';
    document.getElementById('email__error').classList.add('error-border');
  } else {
    document.getElementById('email__error').classList.add('success-border');
  }

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

  // Prevent form submission if there are errors
  if (!isValidEmail(email) || !password || !isPasswordValid(password)) {
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

// Add event listeners to input fields
document.getElementById('email').addEventListener('focus', function () {
  this.classList.remove('error-border');
  this.classList.remove('success-border');
});

document.getElementById('password').addEventListener('focus', function () {
  this.classList.remove('error-border');
  this.classList.remove('success-border');
});
