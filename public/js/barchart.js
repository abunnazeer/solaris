function renderBarChart() {
  axios
    .get('/chart/bar-chart') // Replace with your API endpoint
    .then(response => {
      const overViewData = response.data;
      const chartContainer = document.querySelector('#walletOverview');
      const investedAmount = overViewData.investedAmount;
      const referralBonus = overViewData.referralBonusTotal;
      const withdrawedAmount = overViewData.totalWithdrawalAmount;
      const months = overViewData.months;

      const options = {
        chart: {
          type: 'bar',
          stacked: false,
          toolbar: {
            show: false, // Hides the toolbar (open icon)
          },
        },
        series: [
          {
            name: 'Invested Amount',
            data: investedAmount,
            color: '#2401b6',
          },
          {
            name: 'Referral Bonus',
            data: referralBonus,
            color: '#f89f1e',
          },
          {
            name: 'Withdrawed Amount',
            data: withdrawedAmount,
            color: '#00875a',
          },
        ],
        xaxis: {
          categories: months,
        },
        yaxis: {
          labels: {
            show: false, // Hides y-axis labels (numbers on the left)
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '50%',
            barPadding: '10px', // Controls the padding between bars in a group
            barMargin: 50,
          },
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          position: 'top',
        },
      };

      if (
        investedAmount.length === 0 &&
        referralBonus.length === 0 &&
        withdrawedAmount.length
      ) {
        chartContainer.innerHTML =
          '<div class="no-data">No data available yet</div>';
        chartContainer.style.display = 'block'; // Show the message container
        options.legend.show = false;
      } else {
        chartContainer.style.display = 'block'; // Make sure the chart container is visible
        const chart = new ApexCharts(chartContainer, options);
        chart.render();
      }
    })
    .catch(error => {
      console.error('Error fetching chart data:', error);
    });
}

renderBarChart();
