// Assuming you have a value from the database
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>;

// Assuming you have a value from the database
var dbValue = 4; // Replace this with the actual value from the database

var options = {
  chart: {
    type: 'donut',
  },
  colors: ['#0202a5'],
  series: [dbValue],
  labels: ['Count'],
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: false,
          total: {
            show: true,
            showAlways: true,
            label: 'Count',
            color: '#0202a5',
            fontSize: '22px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => {
                return a + b;
              }, 0);
            },
          },
        },
      },
    },
  },
};

var chart = new ApexCharts(document.querySelector('#donutChart'), options);

chart.render();
