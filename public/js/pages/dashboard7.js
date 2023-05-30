//[Dashboard Javascript]

//Project:	InvestX - Responsive Admin Template
//Primary use:   Used only for the main dashboard (index.html)
//[Javascript]



$(function () {

  'use strict';
	
	var options = {
          series: [{
            name: "$",
            data: [50, 60, 50, 40, 60, 50, 60]
        }],
          chart: {
          height: 250,
          type: 'area',
          zoom: {
            enabled: false
          },        
      toolbar: {
      show: false,
      }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth'
        },
    colors: ['#FFE598'],
        grid: {     
      show: false,
      padding: {
        top: 0,
        bottom: 10,
        right: 10,
        left: 0
      },
        },
    
     legend: {
          show: false,
     },
        xaxis: {
          categories: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      labels: {
              show: true,
      },
      axisBorder: {
              show: false,
      },
      axisTicks: {
              show: false,
      },
          },
    
        yaxis: {
          labels: {
              show: false,
      }
        },
        };

        var chart = new ApexCharts(document.querySelector("#revenue6"), options);
        chart.render();
	
}); // End of use strict



