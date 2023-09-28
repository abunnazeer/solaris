// function renderPieChart() {
//   // Get data from the server using Axios
//   axios
//     .get('/chart/pie-chart') // Replace with your API endpoint
//     .then(response => {
//       const buyPortfolioData = response.data.accountDetails[0]; // Assuming you receive the buyportfolio data here

//       const compoundingDividends = buyPortfolioData.TotalCompoundingBalance;
//       const accountBalance = buyPortfolioData.totalAccountBalance;
//       const accumulatedDividends = buyPortfolioData.accumulatedDividends;

//       var options = {
//         chart: {
//           type: 'pie',
//         },
//         series: [accumulatedDividends, compoundingDividends, accountBalance],
//         labels: [
//           'Accumulated Dividends',
//           'Compounding Dividends',
//           'Account Balance',
//         ],
//         colors: ['#00875a', '#f89f1e', '#2401b6'], // Colors for the segments
//         legend: {
//           position: 'right',
//           labels: {
//             useSeriesColors: true, // Use the same colors as the segments
//           },
//         },
//         dataLabels: {
//           enabled: false,
//         },
//       };

//       var chartContainer = document.querySelector('#financialOverview');

//       if (
//         accumulatedDividends === 0 &&
//         compoundingDividends === 0 &&
//         accountBalance === 0
//       ) {
//         // No data available, show a legend indicating "No data available yet"
//         chartContainer.innerHTML = '<p>No data available yet</p>';
//         chartContainer.style.textAlign = 'center';
//         chartContainer.style.fontSize = '14px';
//         chartContainer.style.color = '#c9c9c9';
//       } else {
//         // Data available, render the chart
//         var chart = new ApexCharts(chartContainer, options);
//         chart.render();
//         console.log('Pie chart rendered successfully');
//       }
//     })
//     .catch(error => {
//       console.error('Error fetching buyportfolio data:', error);
//     });
// }

// let chartInstance; // Global variable to hold the chart instance

// window.addEventListener('resize', function () {
//   // Destroy existing chart before re-rendering
//   if (chartInstance) {
//     chartInstance.destroy();
//   }
//   renderPieChart();
// });
let chartInstance = null; // Global variable to hold the chart instance

window.addEventListener('resize', function () {
  if (chartInstance) {
    chartInstance.destroy();
  }
  renderPieChart();
});

function renderPieChart() {
  // Get data from the server using Axios
  axios
    .get('/chart/pie-chart') // Replace with your API endpoint
    .then(response => {
      // const buyPortfolioData = response.data.accountDetails[0];
      // const compoundingDividends = buyPortfolioData.TotalCompoundingBalance;
      // const accountBalance = buyPortfolioData.totalAccountBalance;
      // const accumulatedDividends = buyPortfolioData.accumulatedDividends;
      const accountDetailsArray = response.data.accountDetails;

      // Initialize variables to store the sum of each field
      let totalCompoundingDividends = 0;
      let totalAccountBalance = 0;
      let totalAccumulatedDividends = 0;

      // Loop through each accountDetail object and accumulate the sums
      accountDetailsArray.forEach(buyPortfolioData => {
        totalCompoundingDividends +=
          buyPortfolioData.TotalCompoundingBalance || 0;
        totalAccountBalance += buyPortfolioData.totalAccountBalance || 0;
        totalAccumulatedDividends += buyPortfolioData.accumulatedDividends || 0;
      });
console.log(totalCompoundingDividends);
      var options = {
        chart: {
          type: 'pie',
          height: window.innerWidth <= 768 ? '280px' : '180px',
        },
        series: [
          totalAccumulatedDividends,
          totalCompoundingDividends,
          totalAccountBalance,
        ],
        labels: [
          'Accumulated Dividends',
          'Compounding Dividends',
          'Account Balance',
        ],
        colors: ['#00875a', '#f89f1e', '#2401b6'],
        legend: {
          position: window.innerWidth <= 768 ? 'bottom' : 'right',
          labels: {
            useSeriesColors: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
      };

      var chartContainer = document.querySelector('#financialOverview');

      if (
        totalAccumulatedDividends === 0 &&
        totalAccumulatedDividends === 0 &&
        totalAccountBalance === 0
      ) {
        chartContainer.innerHTML = '<p>No data available yet</p>';
        chartContainer.style.textAlign = 'center';
        chartContainer.style.fontSize = '14px';
        chartContainer.style.color = '#c9c9c9';
      } else {
        if (chartInstance) {
          chartInstance.destroy(); // Destroy the previous chart instance if it exists
        }
        chartInstance = new ApexCharts(chartContainer, options); // Create a new chart instance and store it in the global variable
        chartInstance.render();
        console.log('Pie chart rendered successfully');
      }
    })
    .catch(error => {
      console.error('Error fetching buyportfolio data:', error);
    });
}

// Initial render
renderPieChart();
