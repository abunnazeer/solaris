const socket = io(); // Connect to the server
console.log('Client socket connected');

socket.on('balanceUpdate', function (message) {
  console.log('Received balance update:', message);
  const data = JSON.parse(message);
  const { portfolioId, balance, compBalance } = data;
  const balanceElement = document.getElementById(`balance-${portfolioId}`);
  const compBalanceElement = document.getElementById(
    `compBalance-${portfolioId}`
  );
  if (balanceElement) {
    balanceElement.textContent = balance.toLocaleString();
  }
  if (compBalanceElement) {
    compBalanceElement.textContent = compBalance.toLocaleString();
  }
  // Update compBalance or perform any other necessary actions
});
