//[widget morris charts Javascript]

//Project:	InvestX - Responsive Admin Template
//Primary use:   Used only for the morris charts

document.addEventListener("DOMContentLoaded", function() {
    // Line chart
    var options = {
        chart: {
            height: 320,
            type: "area",
            zoom: {
                enabled: false
            },
        },
        dataLabels: {
            enabled: false

        },
        stroke: {
            width: [5, 7, 5],
            curve: "straight",
            dashArray: [0, 8, 5]
        },
        colors: ["#18d26b", "#51ce8a", "#00baff"],
        series: [{
                name: "Sales Duration",
                data: [3500, 5000, 3800, 5000, 5800, 4050, 7000]
            },
        ],
        markers: {
            size: 0,
            style: "hollow", // full, hollow, inverted
        },
        xaxis: {
            categories: ["May 2021", "Jun 2021", "Jul 2021", "Aug 2021", "Sep 2021", "Oct 2021", "Nov 2021"],
        },
        tooltip: {
            y: [{
                title: {
                    formatter: function(val) {
                        return val + " (mins)"
                    }
                }
            }, {
                title: {
                    formatter: function(val) {
                        return val + " per session"
                    }
                }
            }, {
                title: {
                    formatter: function(val) {
                        return val;
                    }
                }
            }]
        },
        grid: {
            borderColor: "#f1f1f1",
        }
    }
    var chart = new ApexCharts(
        document.querySelector("#apexcharts-line2"),
        options
    );
    chart.render();
});

document.addEventListener("DOMContentLoaded", function() {
    // Line chart
    var options = {
        chart: {
            height: 320,
            type: "area",
            zoom: {
                enabled: false
            },
        },
        dataLabels: {
            enabled: false

        },
        stroke: {
            width: [5, 7, 5],
            curve: "straight",
            dashArray: [0, 8, 5]
        },
        colors: ["#18d26b", "#51ce8a", "#00baff"],
        series: [{
                name: "Sales Duration",
                data: [3500, 5000, 3800, 5000, 5800, 4050, 7000]
            },
        ],
        markers: {
            size: 0,
            style: "hollow", // full, hollow, inverted
        },
        xaxis: {
            categories: ["May 2021", "Jun 2021", "Jul 2021", "Aug 2021", "Sep 2021", "Oct 2021", "Nov 2021"],
        },
        tooltip: {
            y: [{
                title: {
                    formatter: function(val) {
                        return val + " (mins)"
                    }
                }
            }, {
                title: {
                    formatter: function(val) {
                        return val + " per session"
                    }
                }
            }, {
                title: {
                    formatter: function(val) {
                        return val;
                    }
                }
            }]
        },
        grid: {
            borderColor: "#f1f1f1",
        }
    }
    var chart = new ApexCharts(
        document.querySelector("#apexcharts-line3"),
        options
    );
    chart.render();
});



$(function () {
    "use strict";

 

 // donut chart
        
 /*   Morris.Donut({
        element: 'donut-chart',
        data: [{
            label: "Total",
            value: 5687,

        }, {
            label: "In-Store",
            value: 4572
        }, {
            label: "Retail",
            value: 6870
        }],
        resize: true,
        colors:['#9c72fd', '#ffba3e', '#ff94d5']
    }); */


var options1 = {
          series: [{
          data: [25, 40, 80, 50, 30, 50, 22, 24, 78, 19, 20]
        }],
          chart: {
          type: 'line',
          width: 100,
          height: 70,
          sparkline: {
            enabled: true
          }
        },      
        stroke: {
          curve: 'smooth',
            width: 2,
        },
        colors:['#f2426d'],
        tooltip: {
          fixed: {
            enabled: false
          },
          x: {
            show: false
          },
          y: {
            title: {
              formatter: function (seriesName) {
                return ''
              }
            }
          },
          marker: {
            show: false
          }
        }
        };

        var chart1 = new ApexCharts(document.querySelector("#new-leads-chart2"), options1);
        chart1.render();

        var options1 = {
          series: [{
          data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
        }],
          chart: {
          type: 'line',
          width: 100,
          height: 70,
          sparkline: {
            enabled: true
          }
        },      
        stroke: {
          curve: 'smooth',
            width: 2,
        },
        colors:['#51ce8a'],
        tooltip: {
          fixed: {
            enabled: false
          },
          x: {
            show: false
          },
          y: {
            title: {
              formatter: function (seriesName) {
                return ''
              }
            }
          },
          marker: {
            show: false
          }
        }
        };

        var chart1 = new ApexCharts(document.querySelector("#new-leads-chart3"), options1);
        chart1.render();


        var options1 = {
          series: [{
          data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
        }],
          chart: {
          type: 'line',
          width: 100,
          height: 70,
          sparkline: {
            enabled: true
          }
        },      
        stroke: {
          curve: 'smooth',
            width: 2,
        },
        colors:['#51ce8a'],
        tooltip: {
          fixed: {
            enabled: false
          },
          x: {
            show: false
          },
          y: {
            title: {
              formatter: function (seriesName) {
                return ''
              }
            }
          },
          marker: {
            show: false
          }
        }
        };

        var chart1 = new ApexCharts(document.querySelector("#new-leads-chart4"), options1);
        chart1.render();
	



	
  });





$(function () {
    "use strict";

// area chart
 Morris.Area({
        element: 'area-chart3',
        data: [{
                    period: '2016',
                    data1: 0,
                    data2: 0,
                    data3: 0
                }, {
                    period: '2017',
                    data1: 55,
                    data2: 20,
                    data3: 10
                }, {
                    period: '2018',
                    data1: 25,
                    data2: 55,
                    data3: 70
                }, {
                    period: '2019',
                    data1: 65,
                    data2: 17,
                    data3: 12
                }, {
                    period: '2020',
                    data1: 35,
                    data2: 25,
                    data3: 125
                }, {
                    period: '2021',
                    data1: 30,
                    data2: 85,
                    data3: 45
                }, {
                    period: '2022',
                    data1: 15,
                    data2: 15,
                    data3: 15
                }


                ],
                lineColors: ['#51ce8a','#ff94d5', '#9c72fd' ],
                xkey: 'period',
                ykeys: ['data1', 'data2', 'data3'],
                labels: ['Data 1', 'Data 2', 'Data 3'],
                pointSize: 0,
                lineWidth: 0,
                resize:true,
                fillOpacity: 0.8,
                behaveLikeLine: true,
                gridLineColor: '#e0e0e0',
                hideHover: 'auto'
        
    });
    
    
  });