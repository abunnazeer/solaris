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
    const portfolioData = {
      ...req.body,
      imageName: req.file.filename, // Access the uploaded file's filename
    };
    const portfolio = await Portfolio.create(portfolioData);
    res.status(201).render('msg/succeed', {
      message: 'Portfolio created successfully',
      portfolio,
    });
  } catch (error) {
    return next(new AppError('Failed to create portfolio', 500));
  }
});

// Update portfolio
const updatePortfolio = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedPortfolio = req.body;

  try {
    const portfolio = await Portfolio.findByIdAndUpdate(id, updatedPortfolio, {
      new: true,
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio updated successfully', portfolio });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update portfolio' });
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
