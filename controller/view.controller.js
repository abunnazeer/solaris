const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');
const Profile = require('../models/user/profile.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Portfolio = require('../models/portfolio/portfolio.model');
const buyPortfolio = require('../models/portfolio/buyportfolio.model');
const ReferralBonus = require('../models/user/referralBonus.model');
const axios = require('axios');
const QRCode = require('qrcode');
const Accounts = require('../models/user/accountDetails.model');
const dataAdmin = require('../models/user/dataadmin.model');
const secretKey =
  '6C0-0DVUxLblgkhe7ViRCGI1DslhOjErhaoeuWkLRTrm4cIHEqwkHhSOkN9ywVhj';
const multer = require('multer');

const sendEmail = require('../utils/email');
const { emailKyc } = require('../utils/message/message_kyc');
const TransactionsActivity = require('../models/portfolio/transaction.model');

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
  res.status(201).render('register', {
    title: 'Registration',
  });
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

const getVerificationStatus = (req, res) => {
  res.status(200).render('user/verification_status', {
    title: 'Verification Status',
    heading: 'Verification Status in Progress',
    message:
      'Thank you for your recent application! We want to inform you that your verification status is currently in progress. Our team is diligently reviewing the provided information to ensure accuracy and compliance with our requirements.',
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

const getUserDashbaord = async (req, res) => {
  const getAllprofile = await Profile.find();

  // Assuming you have a currentPage value from somewhere (e.g. query parameters)
  const currentPage = parseInt(req.query.page) || 1;

  // Define how many profiles you want to show per page
  const profilesPerPage = 10;
  const totalProfiles = await Profile.countDocuments();
  const totalPages = Math.ceil(totalProfiles / profilesPerPage);

  res.status(200).render('user/user_dashobard', {
    getAllprofile,
    title: 'User Dashbaord',
    currentPage,
    totalPages,
  });
};
const getDataAdmin = async (req, res) => {
  try {
    // Parse the current page from the query parameters (default to 1 if not present)
    const currentPage = parseInt(req.query.page) || 1;

    // Define how many admin records you want to show per page
    const dataAdminPerPage = 10;

    // Count the total number of admin records
    const totalDataAdmin = await dataAdmin.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalDataAdmin / dataAdminPerPage);

    // Fetch the admin records for the current page
    const getAllData = await dataAdmin
      .find()
      .skip((currentPage - 1) * dataAdminPerPage)
      .limit(dataAdminPerPage);

    // Render the page with the fetched data
    res.status(200).render('user/data_admin', {
      getAllData,
      title: 'Admin Data',
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};

const deleteDataAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    await dataAdmin.findByIdAndDelete(id);
    res.status(200).json({ message: 'User data deleted successfully.' });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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
        const message = emailKyc(approved.firstName, approved.lastName);

        await sendEmail({
          email: user.email,
          subject: `KYC Verification Successful: - ${formatDate(new Date())}`,
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
const fetchCryptoPrices = async (cryptocurrencies, targetCurrency) => {
  try {
    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': '53e53396-66c2-41bc-8531-8b45d59eb2d9',
        },
        params: {
          symbol: cryptocurrencies.join(','),
          convert: targetCurrency,
        },
      }
    );
    return response; // Return the entire response
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {}; // Return an empty object on error
  }
};

const getWalletDetail = catchAsync(async (req, res) => {
  const { id } = req.user; // Assuming the user ID is stored in req.user.id
  const { amount } = req.body;
  const targetCurrency = 'USD';

  const walletAddress = [
    {
      name: 'BTC',
      symbol: 'BTC',

      address: '35fzCfP2rZAUmWyGXUUiBgFBRBarSBBZas',
      price: amount,
    },

    {
      name: 'ETH',
      symbol: 'ETH',
      address: '0x457f18b10467340db29c7e72581e5d4650928d78',
      price: amount,
    },
    {
      name: 'USDT',
      symbol: 'USDT',
      address: 'TLyFun55QXxxk8qqtfhwG2wvfhpN1Poh4M',
      price: amount,
    },
  ];
  const cryptocurrencies = walletAddress.map(crypto => crypto.symbol);

  const response = await fetchCryptoPrices(cryptocurrencies, targetCurrency);
  const cryptoPrices = response.data.data;

  const walletAddressWithPrices = walletAddress.map((crypto, id) => {
    const price =
      cryptoPrices[walletAddress[id].symbol].quote[targetCurrency].price;
    return { ...crypto, price };
  });

  const qrCodes = await Promise.all(
    walletAddressWithPrices.map(async crypto => {
      return QRCode.toDataURL(crypto.address);
    })
  );

  const walletAddressWithQR = await Promise.all(
    walletAddressWithPrices.map(async crypto => {
      const qrCodeData = await QRCode.toDataURL(crypto.address);
      const cryptoAmount = (amount / crypto.price).toFixed(6); // Calculating the cryptoAmount
      return {
        ...crypto,
        qrCode: qrCodeData,
        cryptoAmount, // Include cryptoAmount in the object
      };
    })
  );
  // Fetch portfolios for the user
  const buyPortfolios = await buyPortfolio.find({ userId: id });

  // Fetch account details for the user
  const accountDetails = await Accounts.findOne({ userId: id });

  // Calculate totalAccount and TotalCompoundingBalance
  const totalAccount = accountDetails
    ? accountDetails.totalAccountBalance + accountDetails.totalReferralBonus
    : 0;
  const TotalCompoundingBalance = accountDetails
    ? accountDetails.TotalCompoundingBalance
    : 0;

  const responseObject = {
    walletDetails: walletAddressWithQR,
  };

  // Send JSON response
  res.status(200).json(responseObject);
});

const getActivePortfolio = catchAsync(async (req, res) => {
  const { id } = req.user; // Assuming the user ID is stored in req.user.id
  const { amount } = req.body;
  const targetCurrency = 'USD';

  const walletAddress = [
    {
      name: 'BTC',
      symbol: 'BTC',

      address: '35fzCfP2rZAUmWyGXUUiBgFBRBarSBBZas',
      price: amount,
    },

    {
      name: 'ETH',
      symbol: 'ETH',
      address: '0x457f18b10467340db29c7e72581e5d4650928d78',
      price: amount,
    },
    {
      name: 'USDT',
      symbol: 'USDT',
      address: 'TLyFun55QXxxk8qqtfhwG2wvfhpN1Poh4M',
      price: amount,
    },
  ];
  const cryptocurrencies = walletAddress.map(crypto => crypto.symbol);

  const response = await fetchCryptoPrices(cryptocurrencies, targetCurrency);
  const cryptoPrices = response.data.data;

  const walletAddressWithPrices = walletAddress.map((crypto, id) => {
    const price =
      cryptoPrices[walletAddress[id].symbol].quote[targetCurrency].price;
    return { ...crypto, price };
  });

  const qrCodes = await Promise.all(
    walletAddressWithPrices.map(async crypto => {
      return QRCode.toDataURL(crypto.address);
    })
  );

  const walletAddressWithQR = walletAddressWithPrices.map(crypto => {
    const cryptoAmount = (amount / crypto.price).toFixed(6);
    return { ...crypto, qrCode: qrCodes, cryptoAmount };
  });

  // Fetch portfolios for the user
  const buyPortfolios = await buyPortfolio.find({ userId: id });

  // Fetch account details for the user
  const accountDetails = await Accounts.findOne({ userId: id });

  // Calculate totalAccount and TotalCompoundingBalance
  const totalAccount = accountDetails
    ? accountDetails.totalAccountBalance + accountDetails.totalReferralBonus
    : 0;
  const TotalCompoundingBalance = accountDetails
    ? accountDetails.TotalCompoundingBalance
    : 0;

  // Render the view
  res.status(200).render('portfolio/activeportfolio', {
    title: 'Active Portfolio',
    buyPortfolios,
    totalAccount,
    TotalCompoundingBalance,
    walletAddressWithQR,
  });
});

const postReInvestPortfolio = catchAsync(async (req, res) => {
  const { portfolioId } = req.params;
  const { availableAmount, newAmount } = req.body;
  const { id } = req.user;

  const reInvestPortfolios = await buyPortfolio.find({ userId: id });
  const totalAmount = await Accounts.findOne({ userId: id });
  const userDetail = await User.findOne({ _id: id });

  // Scenario A: Re-Invest from available Balance
  if (availableAmount) {
    const portfolio = reInvestPortfolios.find(
      p => p._id.toString() === portfolioId
    );

    if (portfolio) {
      if (availableAmount) {
        const portfolio = reInvestPortfolios.find(
          p => p._id.toString() === portfolioId
        );
        if (portfolio) {
          const totalBalance =
            totalAmount.totalAccountBalance +
            totalAmount.totalReferralBonus +
            totalAmount.TotalCompoundingBalance;

          if (totalBalance >= parseFloat(availableAmount)) {
            portfolio.amount += parseFloat(availableAmount);

            // Subtract from the total balance
            const subtractedAmount = parseFloat(availableAmount);
            if (totalAmount.totalAccountBalance >= subtractedAmount) {
              totalAmount.totalAccountBalance -= subtractedAmount;
            } else if (
              totalAmount.totalAccountBalance +
                totalAmount.totalReferralBonus >=
              subtractedAmount
            ) {
              totalAmount.totalReferralBonus -=
                subtractedAmount - totalAmount.totalAccountBalance;
              totalAmount.totalAccountBalance = 0;
            } else {
              totalAmount.TotalCompoundingBalance -=
                subtractedAmount -
                (totalAmount.totalAccountBalance +
                  totalAmount.totalReferralBonus);
              totalAmount.totalAccountBalance = 0;
              totalAmount.totalReferralBonus = 0;
            }

            await portfolio.save();
            await totalAmount.save();
            function generateRandomNumber() {
              const min = 10000;
              const max = 99999;
              return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            const date = new Date();
            const transActivity = new TransactionsActivity({
              sn: generateRandomNumber(),
              date: date,
              title: 'Capital Top-up',
              description: `Capital Top-up of $${availableAmount.toLocaleString()} made to ${
                portfolio.portfolioName
              }`,
              buyPortfolioId: portfolio._id,
              status: 'Re Invested',
              amount: availableAmount,
              userId: id,
              method: portfolio.currency,
              authCode: 0,
            });

            await transActivity.save();
          } else {
            return res.status(400).send('Insufficient balance.');
          }
        }
      }

      // Sending an email to admin
      const emailContent = `A user with the following email ${userDetail.email} has re-invested from available balance on ${portfolio.portfolioName}.`;
      await sendEmail({
        email: 'admin@solarisfinance.com',
        subject: 'Re-Investment Alert',
        message: emailContent,
      });

      // Updating the date of expiry for the portfolio
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      await buyPortfolio.updateOne(
        { _id: portfolioId },
        { $set: { dateOfExpiry: oneYearFromNow } }
      );
    }
  }

  // Scenario B: Re-invest using New Amount
  if (newAmount) {
    const portfolio = reInvestPortfolios.find(
      p => p._id.toString() === portfolioId
    );
    if (portfolio) {
      portfolio.depositAmount += parseFloat(newAmount);
      portfolio.invstType = 'ReInvest';
      portfolio.reInvestStatus = 'inactive';
      await portfolio.save();
      function generateRandomNumber() {
        const min = 10000;
        const max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      const date = new Date();
      const transActivity = new TransactionsActivity({
        sn: generateRandomNumber(),
        date: date,
        title: 'Capital Top-up',
        description: `Capital Top-up of $${newAmount.toLocaleString()} made to ${
          portfolio.portfolioName
        }`,
        buyPortfolioId: portfolio._id,
        status: 'Pending Re-Invested',
        amount: newAmount,
        userId: id,
        method: portfolio.currency,
        authCode: 0,
      });
      await transActivity.save();
      // Sending an email to admin
      const emailContent = `A user with the following email ${userDetail.email} has sent a re-investment deposit for ${portfolio.portfolioName}.`;
      await sendEmail({
        email: 'admin@solarisfinance.com',
        subject: 'New Re-Investment Deposit Alert',
        message: emailContent,
      });

      // Render response
      return res.status(200).render('response/status', {
        message:
          'Your Capital Top-up has successfully been sent. Wait for approval shortly',
      });
    }
  }

  // Final Redirect to dashboard
  return res.redirect('/dashboard');
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
  getWalletDetail,
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
  getUserDashbaord,
  getDataAdmin,
  deleteDataAdmin,
};
