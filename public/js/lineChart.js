function renderLineChart() {
  var dbValues = [4, 10, 1, 10, 1, 14]; // Replace these with the actual values from the database

  var options = {
    chart: {
      type: 'line',
      toolbar: {
        show: false, // Hides the toolbar
      },
    },
    colors: ['#0202a5'],
    series: [
      {
        name: 'Data',
        data: dbValues, // Data for the line chart
      },
    ],
    xaxis: {
      labels: {
        show: false, // Hides x-axis labels
      },
      axisBorder: {
        show: false, // Hides x-axis border
      },
      axisTicks: {
        show: false, // Hides x-axis ticks
      },
    },
    yaxis: {
      labels: {
        show: false, // Hides y-axis labels
      },
      axisBorder: {
        show: false, // Hides y-axis border
      },
      axisTicks: {
        show: false, // Hides y-axis ticks
      },
    },
    grid: {
      show: false, // Hides grid lines
    },
    legend: {
      show: false, // Hides legend
    },
    dataLabels: {
      enabled: false, // Hides data labels
    },
    stroke: {
      curve: 'smooth', // Makes the line smooth
      width: 1, // Sets the line width to 1 (thin line)
    },
  };

  var chart = new ApexCharts(document.querySelector('#donutChart'), options);
  chart.render();
}

renderLineChart(); // Call the function to render the chart
