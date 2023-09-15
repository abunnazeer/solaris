const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Define the email option
  const mailOptions = {
    from: 'Solaris Finance <no-reply@solarisfinance.com>',
    to: options.email,
    subject: options.subject,
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
           
          }
          .header {
            background-color: #fff;
            color: #f89f1e;
            padding: 20px;
          }
          .header img {
            width: 200px;
          }
          .footer {
            background-color: #0202a2;
            color: #f89f1e;
            padding: 10px;
          }
          .footer a {
            color:#f89f1e;
          }

          .footer a:hover {
            color:#ffdaa4;
          }
          .content {
            padding: 20px;
            font-size: 16px; /* Increased font size */
          }
          .social-icons img {
            width: 25px;
            margin-right: 10px;
          }
        </style>
      </head>
      <body style="background-color: #f1f1f1;
    padding: 50px 30px;">
        <div style="width:70%; margin:auto; background-color:#fff">
          <div class="header" style="border-bottom: 2px solid #0202a2; text-align:center">
            <img src="https://app.solarisfinance.com/images/blacktrans.png" alt="Logo" />
          </div>
          <div class="content">
            ${options.message}
          </div>
          <div class="footer" style="border-top: 2px solid #0202a2; text-align:center">
            <div class="social-icons">
              <a href="TWITTER_URL_HERE"><img src="https://app.solarisfinance.com/images/icons/twitter.png" alt="Twitter" /></a>
              <a href="FACEBOOK_URL_HERE"><img src="https://app.solarisfinance.com/images/icons/facebook.png" alt="Facebook" /></a>
              <a href="INSTAGRAM_URL_HERE"><img src="https://app.solarisfinance.com/images/icons/instagram.png" alt="Instagram" /></a>
              <a href="LINKEDIN_URL_HERE"><img src="https://app.solarisfinance.com/images/icons/linkedin.png" alt="LinkedIn" /></a>
            </div>
            <p>
              Visit our website: <a href="https://solarisfinance.com" style="color: #f89f1e;">solarisfinance.com</a>
            </p>
            <p>Contact Details: support@solarisfinance.com | contact@solarisfinance.com</p>
          </div>
        </div>
      </body>
    </html>
    `,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
