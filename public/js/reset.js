function isPasswordValid(password) {
  // Dummy implementation, replace with your actual password validation logic
  return (
    password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  );
}

function validateForm(event) {
  // Reset error messages and borders
  document.getElementById('resetPasswordError').textContent = '';
  document.getElementById('password').classList.remove('error-border');
  document.getElementById('password').classList.remove('success-border');
  document.getElementById('resetPasswordConfirmError').textContent = '';
  document.getElementById('passwordConfirm').classList.remove('error-border');
  document.getElementById('passwordConfirm').classList.remove('success-border');

  // Get form values
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  if (!password) {
    document.getElementById('resetPasswordError').textContent =
      'Please enter a password';
    document.getElementById('reset_p__error').classList.add('error-border');
  } else if (!isPasswordValid(password)) {
    document.getElementById('resetPasswordError').textContent =
      'Password must be at least 8 characters long and contain only alphanumeric characters.';
    document.getElementById('reset_p__error').classList.add('error-border');
  } else {
    document.getElementById('reset_p__error').classList.add('success-border');
  }

  if (!passwordConfirm) {
    document.getElementById('resetPasswordConfirmError').textContent =
      'Please enter a password';
    document.getElementById('reset__c__error').classList.add('error-border');
  } else if (password !== passwordConfirm) {
    document.getElementById('resetPasswordConfirmError').textContent =
      'Passwords do not match';
    document.getElementById('reset__c__error').classList.add('error-border');
  } else {
    document.getElementById('reset__c__error').classList.add('success-border');
  }

  // Prevent form submission if there are errors
  if (!isPasswordValid(password) || !passwordConfirm) {
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
