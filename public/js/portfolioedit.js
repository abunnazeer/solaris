function goBack() {
  window.history.back();
}

const buyButton = document.getElementById('buyButton');
buyButton.addEventListener('click', () => {
  window.location.href = '/portfolio/buy-portfolio/<%= portfolio._id %>';
});
