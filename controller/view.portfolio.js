// getting Register and login form
const getPortfolioForm = (req, res) => {
  res.status(200).render('portfolio/portfolioform', {
    title: 'Portfolio Form',
  });
};

module.exports = {
  getPortfolioForm,
};
