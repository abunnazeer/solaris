function renderDonutChart() {
  // Example data
  var seriesData = [70, 30]; // Represents 70% and 30% of the total

  var options = {
    chart: {
      type: 'donut',
      width: '50%', // Adjust the width here
    },
    series: seriesData,
    labels: [],
    colors: ['#0202a5', '#c9c9c9'], // Blue for the outer line, grey for the inner line
    legend: {
      show: false, // Hides legend
    },
    dataLabels: {
      enabled: false, // Hides data labels
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%', // Adjust the size of the inner circle here
          labels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: '#0202a5',
              offsetY: -10,
              formatter: function (val, opts) {
                return opts.globals.series[0] + '%'; // Display the percentage of the first series (Blue)
              },
            },
            total: {
              show: false,
            },
          },
        },
      },
    },
    stroke: {
      width: 1, // Adjust the thickness of the line here
    },
  };

  var chart = new ApexCharts(document.querySelector('#balanceChart'), options);
  chart.render();
}
renderDonutChart();
