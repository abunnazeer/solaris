function emailKyc(firstName, lastName) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h4"><strong>Welcome to Solaris Finance Management</strong></h4>
  
    <p>Dear ${firstName} ${lastName},</p>
  
    <p>We are <strong>pleased to inform you</strong> that your Know Your Customer (KYC) verification process has been <strong>successfully completed</strong>. This marks an important milestone in your journey with Solaris Finance Management.</p>
  
    <p><em>KYC verification</em> is an essential component for ensuring the security and integrity of our investment platform.</p>
  
    <p>We greatly appreciate your cooperation and prompt submission of the required documents. We're excited to officially welcome you as a verified member of our esteemed community.</p>
  
    <p>With your KYC verification now in place, you can proceed confidently with your investment plans. Our team of experts is dedicated to providing you with top-notch financial guidance and support as you navigate the world of investments.</p>
  
    <p>Should you have any questions, require further assistance, or wish to discuss your investment strategy, feel free to reach out to our responsive support team at <a href="mailto:contact@solarisfinance.com">contact@solarisfinance.com</a>. <strong>Your success is our priority</strong>, and we're here to assist you every step of the way.</p>
  
    <p>We look forward to a fruitful and rewarding partnership with you. Thank you for choosing Solaris Finance Management as your preferred investment platform.</p>
  
    <p>Best regards,</p>
    <p><strong>The Solaris Finance Support Team</strong></p>
  </div>
`;
}
module.exports = {
  emailKyc,
};
