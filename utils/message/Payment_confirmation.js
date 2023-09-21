function paymentComfirmationEmail(name) {
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h4>Portfolio Activation Confirmation</h4>

    <p>Dear Investor,</p>
  
    <p>We are <strong>pleased to inform you</strong> that your payment for <span style="font-style: italic;"><strong>${name}</strong></span> has been confirmed. Your portfolio has now been activated, marking a significant milestone in your journey with Solaris Finance Management.</p>
  
    <p>Your commitment to strategic investment planning is truly commendable. We are confident that this step will pave the way for potential growth and wealth accumulation.</p>
  
    <p>We encourage you to take a moment to <strong>review your comprehensive portfolio</strong>.</p>
  
    <p>Our team of skilled analysts and advisors has worked diligently to ensure that your investment strategy aligns with your financial aspirations.</p>
  
    <p>If there are any specific preferences or adjustments you would like to discuss, please don't hesitate to reach out to your dedicated investment advisor or contact our support team at <a href="mailto:Contact@solarisfinance.com">Contact@solarisfinance.com</a>.</p>
  
    <p>At Solaris Finance Management, we are committed to providing exceptional service and fostering a lasting partnership.</p>
  
    <p>As you embark on this journey, rest assured that our team is available to address any inquiries or concerns you may have along the way.</p>

    <p>We <strong>congratulate you</strong> on the successful activation of your investment portfolio and eagerly anticipate the opportunities it will bring.</p>

    <p>Thank you for choosing Solaris Finance Management as your partner in financial growth.</p>
  
    <p>Best regards,</p>
    <p><strong>The Solaris Finance Support Team</strong></p>
  </div>
`;
}
module.exports = {
  paymentComfirmationEmail,
};
