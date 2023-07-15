const Portfolio = require('../models/portfolio/portfolio.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/portfolio');
  },
  filename: (req, file, cb) => {
    const randomNumber = Math.random().toString();
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${randomNumber}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, please upload an image', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const uploadPortfolioPhoto = upload.single('image');
// Get portfolio
const getPortfolio = catchAsync(async (req, res) => {
  const portfolio = await Portfolio.find();
  res.json(portfolio);
});

const createPortfolio = catchAsync(async (req, res, next) => {
  try {
    const highestSerialPortfolio = await Portfolio.findOne(
      {},
      {},
      { sort: { sn: -1 } }
    );
    let serialNumber = '01';

    if (highestSerialPortfolio && highestSerialPortfolio.sn) {
      const highestSerial = highestSerialPortfolio.sn;
      const currentSerialNumber = parseInt(highestSerial, 10);
      if (!isNaN(currentSerialNumber)) {
        const nextSerialNumber = currentSerialNumber + 1;
        serialNumber = nextSerialNumber.toString().padStart(2, '0');
      }
    }

    const portfolioData = {
      sn: serialNumber,
      portfolioTitle: req.body.portfolioTitle,
      description: req.body.description,
      minimumCapital: req.body.minimumCapital,
      returnOnInvestment: {
        rioPText: req.body.rioPText,
        rioPercentage: req.body.rioPercentage,
      },
      compounding: {
        cPText: req.body.cPText,
        cPercentage: req.body.cPercentage,
      },
      duration: req.body.duration,
      imageName: req.file.filename,
    };

    const portfolio = await Portfolio.create(portfolioData);

    res.status(201).render('msg/succeed', {
      message: 'Portfolio created successfully',
      portfolio,
    });
  } catch (error) {
    console.log('Error:', error);
    return next(new AppError('Failed to create portfolio', 500));
  }
});

const updatePortfolio = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const updatedPortfolio = {
      portfolioTitle: req.body.portfolioTitle,
      description: req.body.description,
      minimumCapital: req.body.minimumCapital,
      returnOnInvestment: {
        rioPText: req.body.rioPText,
        rioPercentage: req.body.rioPercentage,
      },
      compounding: {
        cPText: req.body.cPText,
        cPercentage: req.body.cPercentage,
      },
      duration: req.body.duration,
    };

    // Check if an image file was uploaded
    if (req.file) {
      updatedPortfolio.imageName = req.file.filename;
    }

    const portfolio = await Portfolio.findByIdAndUpdate(id, updatedPortfolio, {
      new: true,
      runValidators: true,
    });

    if (!portfolio) {
      console.log('Portfolio not found');
      return res
        .status(404)
        .render('response/status', { message: 'Portfolio not found' });
    }

    console.log('Portfolio updated successfully');

    res
      .status(200)
      .render('response/status', { message: 'Portfolio updated successfully' });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).render('response/status', {
      message: 'Failed to update portfolio',
    });
  }
});

// Delete portfolio
const deletePortfolio = catchAsync(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPortfolio = await Portfolio.findByIdAndRemove(id);

    if (!deletedPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete portfolio' });
  }
});

module.exports = {
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  uploadPortfolioPhoto,
};
