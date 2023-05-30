  //[Dashboard Javascript]

//Project:	InvestX - Responsive Admin Template
//Primary use:   Used only for the main dashboard (index.html)


$(function () {

  'use strict';

  var options = {
          series: [44, 55, 41],
      labels: ['Large Cap Funds', 'Diversified Funds', 'Debt Funds'],
          chart: {
          type: 'donut',
        width: 180,
        },
    colors: ['#46bc5c', '#733aeb', '#51ce8a'],
    legend: {
      show: false,
    },
    plotOptions: {
      pie: { 
      donut: {
        size: '30%',
      },
      },
    },
    dataLabels: {
        enabled: false,
    },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
        };

        var chart = new ApexCharts(document.querySelector("#portfolio-chart"), options);
        chart.render();
  
    
     $('.fund-scorll').slimScroll({ 
      height: '320' 
      });
  



	var options = {
          series: [{
            name: "Desktops",
            data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }],
          chart: {
          height: 150,
          type: 'area',
      toolbar: {
          show: false,
      },
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
      width: 2,
        },
    colors: ['#46bc5c'],
        grid: {
          strokeDashArray: 5,
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      labels: {
              show: false,
      },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        },
    tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val + " %"
            }
          }
        }
        };

        var chart = new ApexCharts(document.querySelector("#investment-chart"), options);
        chart.render();

    var options = {
          series: [{
            name: "Desktops",
            data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }],
          chart: {
          height: 335,
          type: 'area',
      toolbar: {
          show: false,
      },
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
      width: 2,
        },
    colors: ['#46bc5c'],
        grid: {
          strokeDashArray: 5,
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      labels: {
              show: false,
      },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        },
    tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val + " %"
            }
          }
        }
        };

        var chart = new ApexCharts(document.querySelector("#investment-chart2"), options);
        chart.render();

    var options = {
          series: [{
          data: [25, 66, 41, 59, 25, 44, 12, 36, 9, 21]
        }],
          chart: {
          type: 'area',
          height: 100,
          sparkline: {
            enabled: true
          },
        },
        stroke: {
          curve: 'smooth',
      width: 4,
        },
        fill: {
          opacity: 1,
        },
        colors: ['#46bc5c'],
        };

        var chart = new ApexCharts(document.querySelector("#spark_1"), options);
        chart.render();

         var options = {
          series: [{
          data: [50, 30, 20, 60, 50, 12, 24, 40, 50, 60]
        }],
          chart: {
          type: 'area',
          height: 100,
          sparkline: {
            enabled: true
          },
        },
        stroke: {
          curve: 'smooth',
      width: 4,
        },
        fill: {
          opacity: 1,
        },
        colors: ['#46bc5c'],
        };

        var chart = new ApexCharts(document.querySelector("#spark_2"), options);
        chart.render();

 var options = {
          series: [{
          data: [20, 10, 50, 40, 55, 19, 30, 20, 40, 60]
        }],
          chart: {
          type: 'area',
          height: 100,
          sparkline: {
            enabled: true
          },
        },
        stroke: {
          curve: 'smooth',
      width: 4,
        },
        fill: {
          opacity: 1,
        },
        colors: ['#ff3f3f'],
        };

        var chart = new ApexCharts(document.querySelector("#spark_3"), options);
        chart.render();


    var options = {
          series: [{
          data: [110871, 121647, 256421, 262901]
        }],
          chart: {
          type: 'bar',
          height: 100,
          sparkline: {
            enabled: true
          },
        },
        stroke: {
          curve: 'smooth',
      width: 2,
        },
        fill: {
          opacity: 1,
        },
        colors: ['#46bc5c'],
        };

        var chart = new ApexCharts(document.querySelector("#spark2"), options);
        chart.render();
  

var options = {
          series: [76],
          chart: {
          type: 'radialBar',
          offsetY: -20,
          sparkline: {
            enabled: true
          }
        },
    
        stroke: {
      lineCap: "round"
      },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: "#e7e7e7",
              strokeWidth: '97%',
              margin: 5, // margin is in pixels
            },
            dataLabels: {
              name: {
                show: false
              },
              value: {
                offsetY: -20,
                fontSize: '30px'
              }
            }
          }
        },
        grid: {
          padding: {
            top: -10
          }
        },
        labels: ['Average Results'],
        };

        var chart = new ApexCharts(document.querySelector("#revenue9"), options);
        chart.render();




  
	 var options = {
      series: [{
      name: 'ATC',      
      data: [
            [1327359600000,30.95],
            [1327446000000,31.34],
            [1327532400000,31.18],
            [1327618800000,31.05],
            [1327878000000,31.00],
            [1327964400000,30.95],
            [1328050800000,31.24],
            [1328137200000,31.29],
            [1328223600000,31.85],
            [1328482800000,31.86],
            [1328569200000,32.28],
            [1328655600000,32.10],
            [1328742000000,32.65],
            [1328828400000,32.21],
            [1329087600000,32.35],
            [1329174000000,32.44],
            [1329260400000,32.46],
            [1329346800000,32.86],
            [1329433200000,32.75],
            [1329778800000,32.54],
            [1329865200000,32.33],
            [1329951600000,32.97],
            [1330038000000,33.41],
            [1330297200000,33.27],
            [1330383600000,33.27],
            [1330470000000,32.89],
            [1330556400000,33.10],
            [1330642800000,33.73],
            [1330902000000,33.22],
            [1330988400000,31.99],
            [1331074800000,32.41],
            [1331161200000,33.05],
            [1331247600000,33.64],
            [1331506800000,33.56],
            [1331593200000,34.22],
            [1331679600000,33.77],
            [1331766000000,34.17],
            [1331852400000,33.82],
            [1332111600000,34.51],
            [1332198000000,33.16],
            [1332284400000,33.56],
            [1332370800000,33.71],
            [1332457200000,33.81],
            [1332712800000,34.40],
            [1332799200000,34.63],
        ]
    }],
      chart: {
      type: 'area',
      stacked: false,
      height: 273,
      toolbar: {
            show: false
        },
        zoom: {
            enabled: false
        },
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
    },
    title: {
      show: false
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return (val / 1000000).toFixed(0);
        },
      },
      title: {
        show: false
      },
    },
  colors:['#46bc5c'],
    xaxis: {
      type: 'datetime',
    },
    tooltip: {
      shared: false,
      y: {
        formatter: function (val) {
          return (val / 1000000).toFixed(val)
        }
      }
    }
    };

    var chart = new ApexCharts(document.querySelector("#timeseries-chart"), options);
    chart.render();


    new Chart(document.getElementById("bar-chart1"), {
    type: 'bar',
    data: {
      labels: ["January", "February", "March", "April", "May"],
      datasets: [
      {
        label: "Dataset",
        backgroundColor: ["#689f38", "#38649f","#389f99","#ee1044","#ff8f00"],
        data: [8545,6589,5894,4985,1548]
      }
      ]
    },
    options: {
      legend: { display: false },
      title: {
      display: true,
      text: 'My dataset'
      }
    }
  });

   new Chart(document.getElementById("#bar-chart1"), options);
    chart.render();

var options = {
          series: [{
          name: 'PRODUCT A',
          data: [24, 65, 31, 37, 39, 62]
        }, {
          name: 'PRODUCT B',
          data: [-24, -65, -31, -37, -39, -62]
        }],
          chart: {
      foreColor:"#bac0c7",
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: {
            show: false
          },
          zoom: {
            enabled: true
          }
        },    
    grid: {
      show: true,
      borderColor: '#f7f7f7',      
    },
    colors:['#f2426d', '#46bc5c'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '15%',
            borderRadius: 3
          },
        },
        dataLabels: {
          enabled: false
        },
 
        xaxis: {
          type: 'datetime',
          categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT',
            '01/05/2011 GMT', '01/06/2011 GMT'
          ],
        },
    yaxis: {
      axisBorder: {
        show: false
      },
    },
        legend: {
          show: false,
        },
        fill: {
          opacity: 1
        }
        };

        var chart = new ApexCharts(document.querySelector("#charts_widget_1_chart"), options);
        chart.render();
  



var options = {
          series: [{
            name: "Desktops",
            data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }],
          chart: {
          height: 335,
          type: 'area',
      toolbar: {
          show: false,
      },
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
      width: 2,
        },
    colors: ['#46bc5c'],
        grid: {
          strokeDashArray: 5,
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
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
    tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val + " %"
            }
          }
        }
        };

  var chart = new ApexCharts(document.querySelector("#area-chart"), options);
        chart.render();
	
	
		
	
}); // End of use strict



		
	
	
	
