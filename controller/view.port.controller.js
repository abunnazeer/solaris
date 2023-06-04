// getting Register and login form
const getPortfolioForm = (req, res) => {
  res.status(200).render('portfolioform', {
    title: 'portfolio',
  });
};

module.exports = {
  getPortfolioForm,
};
