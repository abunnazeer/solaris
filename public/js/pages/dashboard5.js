//[Dashboard Javascript]

//Project:	InvestX - Responsive Admin Template
//Primary use:   Used only for the main dashboard (index.html)
//[Javascript]



$(function () {
    "use strict";   
    
  /* BOOTSTRAP SLIDER */
    $('.slider').slider()
  
  
  /* flexslider SLIDER */
    $('.flexslider').flexslider({
      animation: "slide"
      });
      $('.flexslider2').flexslider({
      animation: "slide",
      controlNav: "thumbnails"
      });
  /* owl-carousel SLIDER */
    $('.owl-carousel').owlCarousel({
      loop: false,
      margin: 30,
      responsiveClass: true,
      autoplay: true,
      responsive: {
        0: {
        items: 1,
        nav: false
        },
        600: {
        items: 3,
        nav: false
        },
        1000: {
        items: 4,
        nav: true,
        margin: 30
        }
      }
    });

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

  
  }); // End of use strict




$(function () {

  'use strict';
	
	var options = {
          series: [{
          data: [40, 66, 41, 59, 45, 44,70, 60,70]
        }],
          chart: {
          type: 'line',
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
        colors: ['#0dcaf0'],
        };

        var chart = new ApexCharts(document.querySelector("#spark1"), options);
        chart.render();

        var options = {
          series: [{
          data: [55, 66, 70, 60, 65, 44,70, 60]
        }],
          chart: {
          type: 'line',
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
        colors: ['#2500B6'],
        };

        var chart = new ApexCharts(document.querySelector("#spark2"), options);
        chart.render();

        var options = {
          series: [{
          data: [75,55,70, 60,40, 66, 41, 59]
        }],
          chart: {
          type: 'line',
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
        colors: ['#fd7e14'],
        };

        var chart = new ApexCharts(document.querySelector("#spark3"), options);
        chart.render();

        var options = {
          series: [{
          data: [40, 50, 41, 59, 45, 44,70, 60]
        }],
          chart: {
          type: 'line',
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
        colors: ['#d63384'],
        };

        var chart = new ApexCharts(document.querySelector("#spark4"), options);
        chart.render();

        var options7 = {
          series: [85],
          chart: {
          type: 'radialBar',
          width: 80,
          height: 80,
          sparkline: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
    colors:['#2500B6'],
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: '50%'
            },
            track: {
              margin: 0
            },
            dataLabels: {
              show: false
            }
          }
        }
        };

        var chart7 = new ApexCharts(document.querySelector("#booked-revenue-chart"), options7);
        chart7.render();

        var options7 = {
          series: [65],
          chart: {
          type: 'radialBar',
          width: 80,
          height: 80,
          sparkline: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
    colors:['#fd7e14'],
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: '50%'
            },
            track: {
              margin: 0
            },
            dataLabels: {
              show: false
            }
          }
        }
        };

        var chart7 = new ApexCharts(document.querySelector("#booked-revenue-chart2"), options7);
        chart7.render();

        var options7 = {
          series: [55],
          chart: {
          type: 'radialBar',
          width: 80,
          height: 80,
          sparkline: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
    colors:['#0dcaf0'],
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: '50%'
            },
            track: {
              margin: 0
            },
            dataLabels: {
              show: false
            }
          }
        }
        };

        var chart7 = new ApexCharts(document.querySelector("#booked-revenue-chart3"), options7);
        chart7.render();

        var options = {
          series: [44, 55, 25],
          chart: {
          width: 334,
          type: 'donut',
        },
        dataLabels: {
          enabled: false
        },
         labels: ["LTC", "BTC", "ETH"],
         colors: ["#0dcaf0", "#fd7e14", "#2500B6"],
        responsive: [{
          breakpoint: 280,
          options: {
            
            legend: {
              show: false
            }
          }
        }],
        legend: {
          position: 'bottom',
          offsetX: 0,
          height: true,
        }
        };

        var chart = new ApexCharts(document.querySelector("#apexcharts-pie"), options);
        chart.render();
      
      

	
	
}); // End of use strict

document.addEventListener("DOMContentLoaded", function() {
  // Column chart
  var options = {
    chart: {
      height: 320,
      type: "bar",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false
    },

    colors: ["#0dcaf0", "#fd7e14", "#2500B6"],
    stroke: {
      show: true,
      width: 10,
      colors: ["transparent"]
    },
    series: [{
      name: "LTC",
      data: [44, 55, 57 ]
    }, {
      name: "BTC",
      data: [76, 85, 101 ]
    }, {
      name: "ETH",
      data: [35, 41, 36]
    }],
    xaxis: {
      categories: ["January", "Feburary", "March"],
    },
    
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return "$ " + val + " thousands"
        }
      }
    }
  }
  var chart = new ApexCharts(
    document.querySelector("#apexcharts-column"),
    options
  );
  chart.render();
});


document.addEventListener("DOMContentLoaded", function() {
  // Pie chart
  var options = {
    chart: {
      height: 250,
      type: "donut",
    },
    dataLabels: {
      enabled: true
    },
    labels: ["LTC", "BTC", "ETC"],   
    colors: ["#0dcaf0", "#fd7e14", "#2500B6"],
    series: [44, 55, 25]
  }
  var chart = new ApexCharts(
    document.querySelector("#"),
    options
  );
  chart.render();
});