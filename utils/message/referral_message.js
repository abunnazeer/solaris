// Define a function to generate the message
function referralEmail(firstName, lastName, bonusAmount) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h4>Dear ${firstName} ${lastName},</h4>
        <p>We're thrilled to inform you that your diligent efforts have paid off – your downline's investment has been successfully processed, and your commission of <strong>$${bonusAmount.toLocaleString()}</strong> has been credited to your account!</p>

        <p>We're delighted to see your network expanding and your contributions being rewarded. Your commitment to sharing our investment opportunities is truly appreciated.</p>
        
        <p>To view the details of this commission and your updated account balance, simply log in to your Solaris Finance account.</p>

        <p>You'll find comprehensive information about your referrals, commissions, and the overall growth of your network.</p>

        <p> Thank you for being a valuable member of our investor community. Your success is our success, and we're here to support you every step of the way. </p>

        <p>If you have any questions or need assistance, please don't hesitate to contact our dedicated support team</p>

        <p>Best regards,<br/>
        <strong>The Solaris Finance Support Team</strong></p>
    </div>
    `;
}

function emailSubject(bonusAmount) {
  return `Congratulations! You just Earned $${bonusAmount.toLocaleString()} Commission`;
}
module.exports = {
  referralEmail,
  emailSubject,
};
