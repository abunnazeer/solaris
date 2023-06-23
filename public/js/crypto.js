const fetch = require('node-fetch');

// Replace 'YOUR_API_KEY' with your actual CoinMarketCap API key
const apiKey = '53e53396-66c2-41bc-8531-8b45d59eb2d9';

// Define the cryptocurrencies and their codes
const cryptocurrencies = [
  { code: 'bitcoin', name: 'Bitcoin' },
  { code: 'ethereum', name: 'Ethereum' },
  { code: 'tether', name: 'Tether USD' },
  { code: 'tether-erc20', name: 'Tether USD ERC20' },
];

// Define the target currency for conversion (e.g., USD)
const targetCurrency = 'USD';

// Fetch the prices for each cryptocurrency
async function fetchCryptoPrices() {
  try {
    for (const crypto of cryptocurrencies) {
      const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${crypto.code.toUpperCase()}&convert=${targetCurrency}`;
      const response = await fetch(url, {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
      });
      const data = await response.json();
      const price =
        data.data[crypto.code.toUpperCase()].quote[targetCurrency].price;
      console.log(
        `${
          crypto.name
        } (${crypto.code.toUpperCase()}): ${price} ${targetCurrency}`
      );
    }
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
  }
}

// Call the function to fetch crypto prices
fetchCryptoPrices();
