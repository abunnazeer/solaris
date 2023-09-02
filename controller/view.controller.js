const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Portfolio = require('../models/portfolio/portfolio.model');
const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const ReferralBonus = require('../models/user/referralBonus.model');
const ReferralConfig = require('../models/user/referralConfig.model');
const multer = require('multer');

const sendEmail = require('../utils/email');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profile');
  },
  filename: (req, file, cb) => {
    const randomNumber = Math.random().toString();
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${randomNumber}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError('Invalid file type. Please upload an image or a PDF.', 400),
      false
    );
  }
};

const getRegistrationForm = (req, res, next) => {
  // const { email, password, passwordConfirm, role } = req.body;

  res.status(201).render('register', {
    title: 'Registration',
  });
  res.redirect('/user/success');
};

const getBizForm = (req, res, next) => {
  // const { email, password, passwordConfirm, role } = req.body;

  res.status(201).render('bizregister', {
    title: 'Business Registration',
  });
  res.redirect('/user/activation');
};

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

const getForgetPasswordForm = (req, res) => {
  const error = req.query.error; // Retrieve the error message from the query parameters

  res.status(200).render('forgetpassword', {
    title: 'Forget Password',
    error: error,
  });
};

// this Render the reset password form
const getResetPasswordForm = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  res.status(200).render('resetpassword', {
    email: user.email,
  });
});

////////////////////////

const getChangePasswordForm = (req, res) => {
  res.render('changepassword', {
    title: 'Change Password',
  });
};

const getTwoFactor = (req, res) => {
  res.status(200).render('twofactor', {
    title: 'Two Factor',
  });
};

const getProfile = catchAsync(async (req, res) => {
  try {
    // Retrieve the user profile data from the database or any other source
    const userProfile = await Profile.findOne({ _id: req.user._id });
    const user = req.user;
    //  const user = await User.findOne({ _id: id });

    if (!userProfile || !user) {
      // Handle case when user profile or user is not found
      return res.status(404).json({ message: 'User profile not found' });
    }

    const userWithProfile = {
      _id: user._id,
      firstName: userProfile.firstName,
      middleName: userProfile.middleName,
      lastName: userProfile.lastName,
      profilePicture: userProfile.profilePicture,
      phoneNumber: userProfile.phoneNumber,
      email: user.email,
      street: userProfile.address.street,
      state: userProfile.address.state,
      city: userProfile.address.city,
      zip: userProfile.address.zipCode,
      country: userProfile.address.country,
      role: user.role,
      isActive: user.isActive,
      referralCode: user.referralCode,
    };
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/user/register`;
    res.status(200).render('profile', {
      title: 'Profile',
      userProfile: userWithProfile,
      url,
    });
  } catch (error) {
    // Handle error if profile retrieval fails
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

function formatDate(date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  let day = date.getDate();
  let monthIndex = date.getMonth();
  let year = date.getFullYear();

  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const strTime = hours + ' ' + ampm;

  return day + ' ' + months[monthIndex] + ', ' + year + ', ' + strTime;
}

const getProfileVerification = catchAsync(async (req, res) => {
  // Assuming you have the authenticated user object available in 'req.user'
  const user = req.user;

  // Render the view
  res.status(200).render('user/id_verification', {
    title: 'User Verification',
    // You can pass any data you need to the view here
  });
});
const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const uploadDocument = upload.fields([
  { name: 'idCardImage', maxCount: 1 }, // Renamed to match your request body
  { name: 'proofImage', maxCount: 1 },
]);

const postProfileVerification = catchAsync(async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    phoneNumber,
    gender,
    addressStreet,
    addressCity,
    addressState,
    addressCountry,
    addressZipCode,
    idCardNumber,
    idCardType,
    proofType,
  } = req.body;

  const user = req.user;

  try {
    // Check if idCardImage file is uploaded and available in req.files
    if (!req.files || !req.files['idCardImage']) {
      throw new AppError('Please upload Identity Card', 400);
    }

    // Get the filename from req.files
    const idCardImageFilename = req.files['idCardImage'][0].filename;

    let proofImageFilename; // Initialize the variable

    // Check if proofImage file is uploaded and available in req.files
    if (req.files && req.files['proofImage']) {
      proofImageFilename = req.files['proofImage'][0].filename;
    }

    const profile = await Profile.create({
      _id: user._id,
      role: user.role,
      firstName,
      gender,
      middleName,
      lastName,
      phoneNumber,
      address: {
        street: addressStreet,
        city: addressCity,
        state: addressState,
        country: addressCountry,
        zipCode: addressZipCode,
      },
      idCard: {
        cardNumber: idCardNumber,
        iDCardType: idCardType,
        idCardImage: idCardImageFilename, // Use the filename obtained from req.files
      },
      proofOfAddress: {
        proofType,
        proofImage: proofImageFilename,
      },
      submittedDate: formatDate(new Date()),
    });

    const message = `
    <strong>Verification Sent</strong>
    <br> A user with the following email ${user.email} has submitted a new verification.
`;

    await sendEmail({
      email: 'verify-me@solarisfinance.com',
      subject: `[Solaris Finance] User has sent a new Verification - ${formatDate(
        new Date()
      )}`,
      message,
    });

    res.redirect('/user/user-verify-status');
  } catch (err) {
    console.error(err);
    //     res
    //       .status(err.statusCode || 500)
    //       .render('response/error', { message: err.message });
    //     // res.status(err.statusCode || 500).json({ message: err.message });
    //   }
    // });
    res.status(err.statusCode || 500).send(`
      <script>
        alert('${err.message.replace(
          /'/g,
          "\\'"
        )}'); // Escape single quotes in the message
        window.history.back(); // Go back to the previous page
      </script>
    `);
  }
});
// const postProfileVerification = catchAsync(async (req, res) => {
//   const {
//     firstName,
//     middleName,
//     lastName,
//     phoneNumber,
//     gender,
//     addressStreet,
//     addressCity,
//     addressState,
//     addressCountry,
//     addressZipCode,
//     idCardNumber,
//     idCardType,
//     proofType,
//   } = req.body;

//   const user = req.user;

//   try {
//     // Check if idCardImage file is uploaded and available in req.files
//     if (!req.files || !req.files['idCardImage']) {
//       throw new AppError('Please upload Identity Card', 400);
//     }

//     // Get the filename from req.files
//     const idCardImageFilename = req.files['idCardImage'][0].filename;

//     let proofImageFilename; // Initialize the variable

//     // Check if proofImage file is uploaded and available in req.files
//     if (req.files && req.files['proofImage']) {
//       proofImageFilename = req.files['proofImage'][0].filename;
//     }

//     const profile = await Profile.create({
//       _id: user._id,
//       role: user.role,
//       firstName,
//       gender,
//       middleName,
//       lastName,
//       phoneNumber,
//       address: {
//         street: addressStreet,
//         city: addressCity,
//         state: addressState,
//         country: addressCountry,
//         zipCode: addressZipCode,
//       },
//       idCard: {
//         cardNumber: idCardNumber,
//         iDCardType: idCardType,
//         idCardImage: idCardImageFilename, // Use the filename obtained from req.files
//       },
//       proofOfAddress: {
//         proofType,
//         proofImage: proofImageFilename,
//       },
//       submittedDate: formatDate(new Date()),
//     });

//     const message = `
//     <strong>Verification Sennt</strong>
//     <br> A user with following email ${user.email} have submitted an new verification
//    .
// `;
//     await sendEmail({
//       email: 'verify-me@solarisfinance.com',
//       subject: `[Solaris Finance] User has send a new  Verification - ${formatDate(
//         new Date()
//       )}`,
//       message,
//     });

//     res.redirect('/user/user-verify-status');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });

const getVerificationStatus = (req, res) => {
  res.status(200).render('user/verification_status', {
    title: 'Verification Status',
    heading: 'Verification Status in Progress',
    message:
      'Thank you for your recent application! We want to inform you that your verification status is currently in progress. Our team is diligently reviewing the provided information to ensure accuracy and compliance with our requirements',
  });
};

const getUpdateVerification = async (req, res) => {
  try {
    // Assuming you have some authentication mechanism to get the current user's ID
    const currentUserId = req.user._id; // Replace this with your actual way of getting the user ID

    // Find the profile by the current user's ID and render the update_verification view with the profile data
    const updatedProfile = await Profile.findOne({ _id: currentUserId });

    res.render('user/update_verification', {
      title: 'update Verification',
      updatedProfile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

const postUpdateVerification = async (req, res) => {
  try {
    const { idCardType, cardNumber, proofType } = req.body;

    // 1. Check if there is value from the form
    if (!idCardType || !cardNumber || !proofType) {
      return res.status(400).send('Required fields are missing');
    }

    // 2. Check if both file uploads have files
    if (!req.files || !req.files.proofImage) {
      return res.status(400).send('Identity Card Upload is required');
    }

    // Get the filenames
    const proofImage = req.files.proofImage[0].filename;
    const idCardImage = req.files.idCardImage[0].filename;

    // Fetch the current profile
    const currentProfile = await Profile.findOne({ _id: req.user.id });

    // 3. Check profile.verificationFailed and update if necessary
    let updateObj = {
      'idCard.cardNumber': cardNumber,
      'idCard.iDCardType': idCardType,
      'idCard.idCardImage': idCardImage,
      'proofOfAddress.proofType': proofType,
      'proofOfAddress.proofImage': proofImage,
      submittedDate: formatDate(new Date()),
    };

    if (currentProfile.verificationFailed) {
      updateObj.verificationFailed = false;
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { _id: req.user.id },
      updateObj,
      { new: true }
    );
    const user = req.user;

    const message = `
    <strong>Verification Sennt</strong>
    <br> A user with following email ${user.email} have submitted an update verification
   .
`;
    await sendEmail({
      email: 'verify-me@solarisfinance.com',
      subject: `[Solaris Finance] User has send a Verification - ${formatDate(
        new Date()
      )}`,
      message,
    });

    // Redirect to some page after successful update
    res.redirect('/user/verification-status');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
};

const getSuccess = (req, res) => {
  res.status(200).render('success', {
    title: 'Activation',
  });
};

const getVerifyIndex = async (req, res) => {
  const getAllprofile = await Profile.find();

  // Assuming you have a currentPage value from somewhere (e.g. query parameters)
  const currentPage = parseInt(req.query.page) || 1;

  // Define how many profiles you want to show per page
  const profilesPerPage = 10;
  const totalProfiles = await Profile.countDocuments();
  const totalPages = Math.ceil(totalProfiles / profilesPerPage);

  res.status(200).render('user/user_verify_status', {
    getAllprofile,
    title: 'User Verification Index',
    currentPage,
    totalPages,
  });
};

const getVerifyDetail = async (req, res) => {
  const { id } = req.params; // Destructure from req.params
  const getDetail = await Profile.findOne({ _id: id });
  res.status(200).render('user/user_verify_detail', {
    getDetail,
    title: 'Verification Details',
  });
};

const postApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const approved = await Profile.findOne({ _id: id });

    if (approved) {
      approved.verification = true;
      approved.verificationFailed = false;
      await approved.save();

      // Fetch the user's email from the User model using the same id
      const user = await User.findOne({ _id: id });
      if (user && user.email) {
        const message = `
    <strong>Verification Successful</strong>
    <br>
    Congratulations, you have passed the review and are now a Verified customer.
`;

        await sendEmail({
          email: user.email,
          subject: `[Solaris Finance] Verification Successful - ${formatDate(
            new Date()
          )}`,
          message,
        });
      }
    }

    res.redirect('/user/user-verify-status');
  } catch (error) {
    console.error('Error during approval:', error);
    res.status(500).send('Internal Server Error');
  }
};

const postDisApproval = async (req, res) => {
  const { reason, disapprove } = req.body;
  try {
    const { id } = req.params; // Destructure from req.params
    const approved = await Profile.findOne({ _id: id });

    if (approved) {
      approved.verification = false;
      approved.verificationFailed = true; // I assume you meant to set this to false when verification is true
      await approved.save(); // Save the changes
    }

    // Fetch the user's email from the User model using the same id
    const user = await User.findOne({ _id: id });
    if (user && user.email) {
      const message = `
    <strong>Verification Fail</strong><br>
     ${reason} 
    
`;

      await sendEmail({
        email: user.email,
        subject: `[Solaris Finance] Your ${disapprove} Verification failed - ${formatDate(
          new Date()
        )}`,
        message,
      });
    }

    res.redirect('/user/user-verify-status');
  } catch (error) {
    console.error('Error during approval:', error);
    res.status(500).send('Internal Server Error');
  }
};

// //////////// THIS RENDER PORTFOLIO LIST TO BUY//////////

const getInvestPortfolio = catchAsync(async (req, res) => {
  const portfolios = await Portfolio.find();
  const userProfile = await Profile.findOne({ _id: req.user._id });

  const defaultProfile = {
    profilePicture: '../../../images/avatar/avatar-13.png',
    phoneNumber: '0800000000000',
    address: {
      street: 'your street',
      city: 'your city',
      state: 'your state',
      country: 'your country',
      zipCode: 'your zip',
    },
  };

  const isProfileComplete =
    userProfile.profilePicture !== defaultProfile.profilePicture &&
    userProfile.phoneNumber !== defaultProfile.phoneNumber &&
    userProfile.address.street !== defaultProfile.address.street &&
    userProfile.address.city !== defaultProfile.address.city &&
    userProfile.address.state !== defaultProfile.address.state &&
    userProfile.address.country !== defaultProfile.address.country &&
    userProfile.address.zipCode !== defaultProfile.address.zipCode;

  res.status(200).render('portfolio/investmentsportfolio', {
    title: 'buy Portfolio',
    portfolios,
    userProfile,
    isProfileComplete,
  });
});

///////////////Get Active Portfolio//////////////////////////////
//////////////////////////////////////
//////////////
const getActivePortfolio = catchAsync(async (req, res) => {
  const { id } = req.user; // Assuming the user ID is stored in req.user.id
  const buyPortfolios = await buyPortfolio.find({ userId: id });

  // Calculate totalBalance across all portfolios
  let totalBalance = 0;
  buyPortfolios.forEach(portfolio => {
    totalBalance += portfolio.balance;
  });

  // Fetch all referral bonuses for this user
  const totalBonusDocs = await ReferralBonus.find({ referringUserId: id });

  // Calculate totalBonus
  let totalBonus = 0;
  totalBonusDocs.forEach(bonusDoc => {
    if (bonusDoc.bonusAmount) {
      totalBonus += parseFloat(bonusDoc.bonusAmount);
    }
  });
  // Calculate the combined total for withdrawals
  const totalForWithdrawals = totalBalance + totalBonus;

  res.status(200).render('portfolio/activeportfolio', {
    title: 'Active Portfolio',
    totalForWithdrawals,
    buyPortfolios,
  });
});

const postReInvestPortfolio = catchAsync(async (req, res) => {
  const { portfolioId } = req.params;

  const { amount } = req.body;
  const { id } = req.user;
  const reInvestPortfolios = await buyPortfolio.find({ userId: id });

  const userDetail = await User.findOne({ _id: id });

  let totalBalance = 0;
  reInvestPortfolios.forEach(portfolio => {
    totalBalance += portfolio.balance;
  });

  const totalBonusDocs = await ReferralBonus.find({ referringUserId: id });
  let totalBonus = 0;
  totalBonusDocs.forEach(bonusDoc => {
    if (bonusDoc.bonusAmount) {
      totalBonus += parseFloat(bonusDoc.bonusAmount);
    }
  });

  await buyPortfolio.updateOne(
    { _id: portfolioId },
    { $inc: { amount: parseFloat(amount) } }
  );

  const updatedPortfolio = await buyPortfolio.findOneAndUpdate(
    { _id: portfolioId },
    { $inc: { balance: -amount } },
    { new: true }
  );

  // Check if the updated balance is zero
  if (updatedPortfolio.balance === 0) {
    // Find all referral bonuses associated with the user
    const referralBonuses = await ReferralBonus.find({ referringUserId: id });

    if (referralBonuses.length > 0) {
      let allBonusesZero = true;

      // Loop through each referralBonus document and update it
      for (const referralBonus of referralBonuses) {
        console.log(
          `Current bonus amount before update: ${referralBonus.bonusAmount}`
        );

        // If bonusAmount is greater than zero, set allBonusesZero to false
        if (referralBonus.bonusAmount > 0) {
          allBonusesZero = false;

          // Subtract the amount from each bonusAmount
          const updatedReferralBonus = await ReferralBonus.findOneAndUpdate(
            { _id: referralBonus._id },
            { $inc: { bonusAmount: -parseFloat(amount) } },
            { new: true }
          );

          console.log(
            `Updated bonus amount: ${updatedReferralBonus.bonusAmount}`
          );
        }
      }

      if (allBonusesZero) {
        console.log('All bonuses are zero.');
      }
    } else {
      console.log('No referral bonuses found for this user.');
    }
  }

  // 3. Send an email to admin
  const emailContent = `A user with the following email ${userDetail.email} has re-invested on ${reInvestPortfolios[0].portfolioName}.`;
  await sendEmail({
    email: 'admin@solarisfinance.com',
    subject: 'Re-Investment Alert',
    message: emailContent,
  });

  // 4. Update buyPortfolio.dateOfExpiry to be one year from the current date for the portfolio being reinvested
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  await buyPortfolio.updateOne(
    { _id: portfolioId },
    { $set: { dateOfExpiry: oneYearFromNow } }
  );

  res.redirect('/dashboard');
});

const getInvestHistory = catchAsync(async (req, res) => {
  const userId = req.user.id; // Assuming the user ID is stored in req.user.id
  const buyPortfolios = await buyPortfolio.find({ userId: userId });

  res.status(200).render('portfolio/investhistory', {
    title: 'Expired Portfolio',
    buyPortfolios,
  });
});

const getDetailsPage = (req, res) => {
  res
    .status(200)
    .render('portfolio/detailspage', { title: 'Portfolio Detail page' });
};

const getShortTermForm = (req, res) => {
  res
    .status(200)
    .render('portfolio/shorttermfunds', { title: 'Short Term Open Funds' });
};

const activation = (req, res) => {
  res.status(200).render('user/activation', { title: 'Short Term Open Funds' });
};

module.exports = {
  getRegistrationForm,
  getLoginForm,
  getForgetPasswordForm,
  getProfile,
  getBizForm,
  getResetPasswordForm,
  getSuccess,

  getChangePasswordForm,
  getTwoFactor,

  // PORTFOLIO
  getInvestPortfolio,
  getActivePortfolio,
  getInvestHistory,
  getShortTermForm,
  getDetailsPage,
  activation,
  getProfileVerification,
  getVerificationStatus,
  getUpdateVerification,
  postReInvestPortfolio,

  postUpdateVerification,
  postProfileVerification,
  uploadDocument,
  getVerifyIndex,
  getVerifyDetail,
  postApproval,
  postDisApproval,
};
