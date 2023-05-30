const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // secure: true,

    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // define the email option
  const mailOptions = {
    from: 'Solaris Finance <test@abunnazeer.com.ng>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //   html:
  };
  //send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

// const sendEmail = async (subject, message, reply_to, send_to, send_from) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     // secure: true,

//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });
//   const options = {
//     from: send_from,
//     to: send_to,
//     replyTo: reply_to,
//     subject: subject,
//     html: message,
//   };
//   transporter.sendMail(options, function (err, info) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(info);
//     }
//   });
// };
// module.exports = sendEmail;
