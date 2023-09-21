function emailVerification(url) {
  return `
  <p>Please verify your email address</p>

  <p>Welcome Aboard</p>

  <p>We're thrilled that you've taken the step to join Solaris Finance Management!</p>

  <p>Your journey with us is about to begin, and to ensure everything goes smoothly, we kindly ask you to click on the button below. By doing so, you'll be verifying your email address and unlocking the full potential of your Solaris experience.</p>
  
  <p><a href="${url}" style="background-color:  #0202a2; color: white; padding: 10px 15px; margin: 8px 5px; border: none; cursor: pointer;">CLICK TO VERIFY</a></p>
  
  <p>Should you encounter any difficulties, simply copy and paste the following URL into your web browser:</p>
  
  <p>${url}</p>
  
  <p>Thank you for choosing Solaris Finance Management. We're excited to have you with us and look forward to embarking on this journey together!</p>
 
  <p>Sincerely,</p>
 
  <p>The Solaris Finance Support Team.</p>`;
}
module.exports = {
  emailVerification,
};
