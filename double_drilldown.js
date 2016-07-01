
//Toggle lines to drill down http://jsfiddle.net/mv9FV/6/
//drilldown on line  http://jsfiddle.net/JPzqn/  could be used for months
//http://jsfiddle.net/49q18Lp3/
//https://github.com/highcharts/highcharts/issues/3771
//http://forum.highcharts.com/highcharts-usage/get-drill-down-and-drill-up-events-in-drill-down-highchart-t33488/

//http://jsfiddle.net/dLtmtq3h/3/ <--- old version of this chart
//http://jsfiddle.net/jkrpray1/6/

//http://jsfiddle.net/tfaejxn3/ buttons

//block call not function!
(function () {

    //global chart variabls
    var chart_1, chart_2;
    //global chart options
    var options_1, options_2;
    //global variable for chart depth
    var depth_1, depth_2;
    //whether category was pressed or not
    var categoryPressed = false;
    //if drill call comes from switching charts
    var switchCall = false;
    var points_drilled = [];


    //define types of x-Axis 
    var xAxis_monthly = {
                    tickInterval: (24 * 3600 * 1000 * 28),
                    labels: {
                        rotation: 0, 
                        align: 'center'
                    }};
    var xAxis_daily ={
                    tickInterval: (24 * 3600 * 1000),
                    labels: {
                        rotation: -90,
                        align: 'right'
                    }};
    var xAxis_yearly ={
                    tickInterval: (24 * 3600 * 1000 * 365),
                    labels: {
                        rotation: 0, 
                        align: 'center'
                    }};     
    //create trace volume chart   
    function annual_trace_hghy_chart() {

        //set up drilldown series
        var drillNames_1 = ['HG Monthly Flow', 'HY Monthly Flow'];
        var drillDowns_1 = {series: []};
        $.get('data/trace_monthly_hghy.csv', function (drillData_1) {
            readDrilldownCSV(drillDowns_1, drillData_1, 1000000000, drillNames_1);
        });


        var drillNames_2 = ['HG Total Flow', 'HY Total Flow'];
        var drillDowns_2 = {series: []};
        $.get('data/trace_total_hghy.csv', function (drillData_2) {
            readDrilldownCSV(drillDowns_2, drillData_2, 1000000000, drillNames_2);
        });

        var drillNames_3 = ['HG Client Sell', 'HG Client Inter-Dealer', 'HG Client Buy','HY Client Sell', 'HY Client Inter-Dealer', 'HY Client Buy'];
        var drillDowns_3 = {series: []};
        $.get('data/trace_volume_hghy.csv', function (drillData_3) {
            readDrilldownCSV(drillDowns_3, drillData_3, 1000000000, drillNames_3);
        });
        //how many "levels" from top char can you drill
        var depthLimit = 3;
        //set starting depth to zero
        depth_1 = 0;
        //keep track of number of times drill up will be called
        var drillup_calls = [];
        //number of categogries in a category call
        var numCategories = 0;           
                       
        //var to record any errors while getting data
        var jqxhr_annual_trace_hghy = $.get('data/trace_annual_hghy.csv', function (data) {
            //set up chart 
            options_1 = {
                //set chart type
                chart: {
                    type: 'line',
                    renderTo: 'annual_trace_volume_hghy_1_container',
                    alignTicks: false, 
                    events: {
                        drilldown: function (e) {
                            if (!e.seriesOptions) {
                                //instantiate necessary local variables
                                var colorSet = ['#002244', '#DBBB33', '#639741', '#E6D399', '#43C5F3', '#87899E', '#357895', '#336600', '#FF3399', '#669999', '#7FCC99', '#430086', '#b8b814', '#0E0E0E'];                            
                                var hg_colors = ['#002244', '#E6D399', '#639741'];
                                var hy_colors = ['#DBBB33', '#43C5F3', '#87899E']
                                var drillColors = [];        
                                var drillSeries = [];
                                var series0 = { data : []};
                                var series1 = { data : []};
                                var type = e.point.series.name.split(' ')[0];

                                //save drilldown call 
                                var copyPoint = {
                                    //One series then index = 0
                                    seriesIndex: 0,
                                    category: false,
                                    pointIndex: e.point.series.data.indexOf(e.point)
                                };

                                //Two series then HG vs HY
                                if (this.series.length == 2){
                                    if (type == 'HG'){
                                        //keep index as 0
                                    }
                                    else if (type == 'HY'){
                                        copyPoint.seriesIndex = 1;
                                    }
                                    else {
                                        console.log("Invalid series name.");
                                    }
                                }                            
                                //define drillDowns for each 'level'
                                if (!e.category){
                                    depth_1++;
                                    //save drilldown call if not during a chart switch
                                    if(!switchCall){points_drilled.push(copyPoint);}
                                }
                                else {
                                    //first drilldown call on category click
                                    if (categoryPressed === false){
                                        categoryPressed = true;
                                        numCategories = this.series.length;
                                    }
                                    //check if its the last category call 
                                    if (numCategories === 1){
                                        numCategories--;
                                        depth_1++;

                                        //save drilldown on last category call if not during a chart switch
                                        copyPoint.category = true;
                                        if(!switchCall){points_drilled.push(copyPoint);}
                                    }
                                    //numCategories > 1 (mid calls so do nothing)
                                    else {
                                        numCategories--;
                                    }
                                }
                                //instantiate necessary date variables
                                var oneDay = 86400000;
                                var pointDate = new Date(e.point.x+oneDay);
                                var pointYear = pointDate.getFullYear();
                                var pointMonth = pointDate.getMonth();
                                //check for leap year
                                var isLeapYear = !(pointYear % 4) && (pointYear % 100) || !(pointYear % 400);
                                var daysInMonths = [0,31,28,31,30,31,30,31,31,30,31,30,31];
                                //if leap year correct february
                                if (isLeapYear) daysInMonths[2] = 29;
                                //drill from first graph
                                if (depth_1 === 1){
                                    var nextMonth = e.point.x; 

                                    //if its a normall drilldown
                                    if (categoryPressed === false){
                                        var seriesNum;
                                        //if HG then do only HG
                                        if (type === 'HG'){
                                            seriesNum = 0;
                                            drillColors = hg_colors;
                                            series0.name = drillNames_1[0];
                                        }
                                        else if (type === 'HY'){
                                            seriesNum = 1;
                                            drillColors = hy_colors;
                                            series0.name = drillNames_1[1];
                                        }
                                        else {
                                            console.log("Error: Invalid type for drilldown.");
                                        }
                                        for (var i = 0; i < 12; i++){
                                            nextMonth = nextMonth + (oneDay*daysInMonths[i]);
                                            if (drillDowns_1.series[nextMonth+"_"+seriesNum]){
                                                series0.data.push({ x: drillDowns_1.series[nextMonth+"_"+seriesNum].data[0].x,
                                                                    y: drillDowns_1.series[nextMonth+"_"+seriesNum].data[0].y     });
                                                }
                                        }
                                        drillSeries = [series0];
                                    }
                                    //if its the final categpory call
                                    //drill to all series
                                    else if (numCategories === 0 && categoryPressed){
                                        for (var i = 0; i < 12; i++){
                                            nextMonth += (oneDay*daysInMonths[i]);
                                            if (drillDowns_1.series[nextMonth+"_0"]){
                                                series0.data.push({x: drillDowns_1.series[nextMonth+"_0"].data[0].x,
                                                                   y: drillDowns_1.series[nextMonth+"_0"].data[0].y     });
                                                series1.data.push({x: drillDowns_1.series[nextMonth+"_1"].data[0].x,
                                                                   y: drillDowns_1.series[nextMonth+"_1"].data[0].y     });
                                            }
                                        }
                                        series0.name = drillNames_1[0];
                                        series1.name = drillNames_1[1];
                                        drillSeries = [series0, series1];
                                        drillColors = colorSet;
                                        //reset categoryPressed bool
                                        categoryPressed = false;
                                    }
                                    //if category is pressed and we are mid calls
                                    //do nothing
                                    //update x-axis labeling
                                    this.xAxis[0].update(xAxis_monthly);
                                    //show switch buttons
                                    $('#annual_trace_volume_hghy_2_btn').toggle(true);
                                }
                                //drilling from second graph
                                else if (depth_1 === 2){
                                    var firstDay = e.point.x;
                                    //86400000 == one day in UTC
                                    var nextDay;
                                    var numDays = daysInMonths[pointMonth+1];
                                    //if its a normall drilldown or category call on single series
                                    if (categoryPressed === false || (categoryPressed && (this.series.length === 1))){
                                        var seriesNum;
                                        //if HG then do only HG
                                        if (type === 'HG'){
                                            seriesNum = 0;
                                            drillColors = hg_colors;
                                            series0.name = drillNames_2[0];
                                        }
                                        else if (type === 'HY'){
                                            seriesNum = 1;
                                            drillColors = hy_colors;
                                            series0.name = drillNames_2[1];
                                        }
                                        else {
                                            console.log("Error: Invalid type for drilldown.");
                                        }
                                        for (var i = 0; i < numDays; i++){
                                           nextDay = firstDay + (i*oneDay);
                                           if (drillDowns_2.series[nextDay+"_"+seriesNum]){
                                                series0.data.push({  x: drillDowns_2.series[nextDay+"_"+seriesNum].data[0].x,
                                                                     y: drillDowns_2.series[nextDay+"_"+seriesNum].data[0].y     });
                                                }
                                        }
                                        //if category call reset boolean
                                        if (categoryPressed) categoryPressed = false;
                                        drillSeries = [series0];
                                    }
                                    //if its the final categpory call
                                    //drill to all series
                                    else if (numCategories === 0 && categoryPressed){
                                        for (var i = 0; i < numDays; i++){
                                            nextDay = firstDay + (i*oneDay);
                                            if (drillDowns_2.series[nextDay+"_0"]){
                                                series0.data.push({x: drillDowns_2.series[nextDay+"_0"].data[0].x,
                                                                   y: drillDowns_2.series[nextDay+"_0"].data[0].y     });
                                                series1.data.push({x: drillDowns_2.series[nextDay+"_1"].data[0].x,
                                                                   y: drillDowns_2.series[nextDay+"_1"].data[0].y     });
                                            }
                                        }
                                        series0.name = drillNames_1[0];
                                        series1.name = drillNames_1[1];
                                        drillSeries = [series0, series1];
                                        drillColors = colorSet;
                                        //reset categoryPressed bool
                                        categoryPressed = false;

                                        //set series pointWidth
                                        series0.pointWidth = 7;
                                        series1.pointWidth = 7;
                                    }
                                    //if category is pressed and we are mid calls
                                    //do nothing

                                    //update x-axis labeling
                                    this.xAxis[0].update(xAxis_daily);
                                    //show switch button
                                    $('#annual_trace_volume_hghy_2_btn').toggle(true);

                                }
                                //drilling from third graph
                                else if (depth_1 == 3){
                                    //if normal call or category call on a single series 
                                    if (categoryPressed === false || (categoryPressed && (this.series.length === 1))){
                                        //check which type of series was called
                                        if (type === 'HG'){
                                            drillSeries = [drillDowns_3.series[e.point.x + "_0"],drillDowns_3.series[e.point.x + "_1"],drillDowns_3.series[e.point.x + "_2"]];
                                            drillColors = hg_colors;
                                        }
                                        else if (type === 'HY'){
                                            drillSeries = [drillDowns_3.series[e.point.x + "_3"],drillDowns_3.series[e.point.x + "_4"],drillDowns_3.series[e.point.x + "_5"]];
                                            drillColors = hy_colors;
                                        }
                                        else {console.log("Error: Invalid type for drilldown.")}
                                        //if category call reset boolean
                                        if (categoryPressed) categoryPressed = false;
                                    }
                                    //if category call with multiple series 
                                    else if (numCategories === 0 && categoryPressed){
                                        drillSeries = [drillDowns_3.series[e.point.x + "_0"],drillDowns_3.series[e.point.x + "_1"],drillDowns_3.series[e.point.x + "_2"],drillDowns_3.series[e.point.x + "_3"],drillDowns_3.series[e.point.x + "_4"],drillDowns_3.series[e.point.x + "_5"]];
                                        categoryPressed = false;
                                        drillColors = hg_colors.concat(hy_colors);
                                    }
                                    //update x-axis labeling
                                    this.xAxis[0].update(xAxis_monthly);
                                    //show switch button
                                    $('#annual_trace_volume_hghy_2_btn').toggle(true);
                                }
                                else {
                                    //depth_1 error
                                    console.log("Category Call.");
                                }
                                //set colors and set as drillable
                                for (var i = 0; i < drillSeries.length; i++){
                                    drillSeries[i].color = drillColors[i];
                                    if (depth_1 != depthLimit){
                                        for (var j = 0; j < drillSeries[0].data.length; j++){
                                            drillSeries[i].data[j].drilldown = true;
                                        }
                                    }
                                    //if not on initial chart set type of chart to column
                                    if (depth_1 != 0){
                                        drillSeries[i].type = 'column';
                                    }
                                    this.addSingleSeriesAsDrilldown(e.point, drillSeries[i]);
                                }
                                //do not add to drill up calls if mid category calls
                                if (!categoryPressed){
                                    drillup_calls.push(drillSeries.length);
                                }
                                //apply the drilldown
                                this.applyDrilldown();

                                //if switch button isn't created make it
                                if (!this.switchToStacked){
                                    makeSwtichButton();
                                }
                                //else display it
                                else {
                                    this.switchToStacked.show();
                                }
                            }
                        },
                        drillup: function(e){
                            //if on last call then decrement depth_1 and remove its instance
                            if (drillup_calls[drillup_calls.length-1] === 1){
                                depth_1--;
                                //remove drillup call instance 
                                drillup_calls = drillup_calls.slice(0,drillup_calls.length-1);
                                //update axis to fix drilled up chart
                                switch (depth_1) {
                                    case 1:
                                        this.xAxis[0].update(xAxis_monthly);
                                        break;
                                    case 2:
                                        this.xAxis[0].update(xAxis_daily);
                                        break;
                                    case 3:
                                        this.xAxis[0].update(xAxis_monthly);
                                        break;
                                    default:
                                        if(this.switchToStacked){   this.switchToStacked.hide();}
                                        this.xAxis[0].update(xAxis_yearly);
                                        $('.chart-btn').toggle(false);
                                   }

                                //delete saved drillpoint
                                //if not drilling up to switch
                                if (!switchCall){
                                    points_drilled = points_drilled.slice(0, points_drilled.length - 1);
                                }
                            }
                            else {
                                drillup_calls[drillup_calls.length-1]--;
                            }
                        }
                    }
                },

                //set title 
                title: {
                    text: 'TRACE Annual Flow',
                    style: {
                        color: '#4D759E'
                    },
                    align: 'center'
                },
                //set subtitle
                subtitle: {
                    text: "Click on data or a category for more information"
                },
                //set x-axis 
                xAxis: [{
                    title: {
                        text: 'Date',
                        style: {
                            color: '#4D759E',
                            fontWeight: 'bold'
                        }
                    },
                    gridLineWidth: 1,
                    type: 'datetime',
                    tickInterval: (24 * 3600 * 1000 * 365),
                    labels: {
                        align: 'center',
                        y: 11
                    }
                }],
                //set y-axis 
                yAxis: {
                    title: {
                        text: 'TRACE Annual Flow ( Billions USD )',
                        style: {
                            color: '#4D759E',
                            fontWeight: 'bold'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return Highcharts.numberFormat(this.value, 0, '', ',');
                        }
                    }
                },
                //set tooltip       
                tooltip: {
                    valuePrefix: '$',
                    valueSuffix: ' Billion',
                    valueDecimals: 2,
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
                },
                //set legend
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    borderWidth: 1,
                    borderRadius: 5
                },
                //instantiate series
                series: [],
                //instantiate drilldown
                drilldown: {
                    series: []
                },
                //set colors for series
                colors: ['#002244', '#DBBB33', '#639741', '#43C5F3'],
                //set general plot options
                plotOptions: {
                    column: {
                        pointPadding: 0,
                        borderWidth: 0,
                        //have colums next to each other rather than stack
                        stacking: undefined
                    },
                    line: {
                        //make data label markers always a circle
                        marker: {
                            symbol: 'circle'
                        }
                    }
                },
                //set name of chart downloads
                exporting: {
                    filename: 'MarketAxess_annual_trace_volume_hghy',
                    //enable download icon
                    enabled: true,
                    //add image to download 
                    chartOptions: {
                        chart: {
                            events: {
                                load: function () {
                                    this.renderer.image('http://www.marketaxess.com/images/marketaxess_logo2.gif', 90, 75, 300, 48).attr({
                                        opacity: 0.1
                                        }).add();
                                }
                            }
                        }
                    }
                },
                //disable credits
                credits: {
                    enabled: false
                }
            };
            //names of labels in order of series
            var names = ['HG Annual Flow', 'HY Annual Flow'];
            //get csv file, divide by 1 billion and populate chart
            readCSV(options_1, data, 1000000000, names);

            //make all datable drill-able
            for (var i = 0; i < options_1.series.length; i++){
                for (var j = 0; j < options_1.series[i].data.length; j++){
                    options_1.series[i].data[j].drilldown = true;
                }
            }

            chart_1 = new Highcharts.Chart(options_1);

            //button: function (text, x, y, callback, normalState, hoverState, pressedState, disabledState, shape)

            function makeSwtichButton(){
                chart_1.switchToStacked = chart_1.renderer.button('See this Data Stacked',150, 81, function() {},
                    {
                        //normal state
                         zIndex: 3
                    }, 
                    {//hover state
                    }
                    ).on('click', function () { 
                        switchCall = true;
                            
                        $('.chart_container').toggle(false);
                        $('#annual_trace_volume_hghy_2_container').toggle(true);
                        $('#annual_trace_volume_hghy_2_container').highcharts().destroy();
                         //reset chart
                         chart_2 = new Highcharts.Chart(options_2);
                         chart_2.xAxis[0].update(xAxis_yearly);
                         depth_2 = 0;

                         //do normal drill down 
                         for (var i = 0; i < points_drilled.length; i++){
                             point = points_drilled[i];
                             if (point.category){categoryPressed = true;}
                             //apply drilldown based on which chart it is switching to 
                             chart_2.series[point.seriesIndex].data[point.pointIndex].doDrilldown();
                        }
                        switchCall = false;
                    }).add();
            }

        })
            //if fails display error 
            .fail(function (jqxhr_annual_trace_hghy, exception) {
                ajaxError(jqxhr_annual_trace_hghy, exception, '#annual_trace_volume_hghy_1_container');
        });
    }

    //create trace volume chart   
    function annual_trace_hghy_chart_2() {

        //set up drilldown serie
        var drillNames_1 = ['HG Monthly Flow Stacked', 'HY Monthly Flow Stacked'];
        var drillDowns_1 = {series: []};
        $.get('data/trace_monthly_hghy.csv', function (drillData_1) {
            readDrilldownCSV(drillDowns_1, drillData_1, 1000000000, drillNames_1);
        });


        var drillNames_2 = ['HG Total Flow Stacked', 'HY Total Flow Stacked'];
        var drillDowns_2 = {series: []};
        $.get('data/trace_total_hghy.csv', function (drillData_2) {
            readDrilldownCSV(drillDowns_2, drillData_2, 1000000000, drillNames_2);
        });

        var drillNames_3 = ['HG Client Sell Stacked', 'HG Inter-Dealer Stacked','HG Client Buy Stacked', 'HY Client Sell Stacked', 'HY Inter-Dealer Stacked','HY Client Buy Stacked'];
        var drillDowns_3 = {series: []};
        $.get('data/trace_volume_hghy.csv', function (drillData_3) {
            readDrilldownCSV(drillDowns_3, drillData_3, 1000000000, drillNames_3);
        });
        //how many "levels" from top char can you drill
        var depthLimit = 3;
        //set starting depth to zero
        depth_2 = 0;
        //keep track of number of times drill up will be called
        var drillup_calls = [];
        //number of categogries in a category call
        var numCategories = 0;

        //var to record any errors while getting data
        var jqxhr_annual_trace_hghy_2 = $.get('data/trace_annual_hghy.csv', function (data) {
            //set up chart 
            options_2 = {
                //set chart type
                chart: {
                    type: 'line',
                    renderTo: 'annual_trace_volume_hghy_2_container',
                    alignTicks: false, 
                    events: {
                        drilldown: function (e) {
                            if (!e.seriesOptions) {
                                //instantiate necessary local variables
                                var colorSet = ['#002244', '#DBBB33', '#639741', '#E6D399', '#43C5F3', '#87899E', '#357895', '#336600', '#FF3399', '#669999', '#7FCC99', '#430086', '#b8b814', '#0E0E0E'];                            
                                var hg_colors = ['#002244', '#E6D399', '#639741'];
                                var hy_colors = ['#DBBB33', '#43C5F3', '#87899E']
                                var drillColors = [];        
                                var drillSeries = [];
                                var series0 = { data : []};
                                var series1 = { data : []};
                                var type = e.point.series.name.split(' ')[0];
        
                                //save drilldown call 
                                var copyPoint = {
                                    //One series then index = 0
                                    seriesIndex: 0,
                                    category: false,
                                    pointIndex: e.point.series.data.indexOf(e.point)
                                };

                                //Two series then HG vs HY
                                if (this.series.length == 2){
                                    if (type == 'HG'){
                                        //keep index as 0
                                    }
                                    else if (type == 'HY'){
                                        copyPoint.seriesIndex = 1;
                                    }
                                    else {
                                        console.log("Invalid series name.");
                                    }
                                }                            
                                //define drillDowns for each 'level'
                                if (!e.category){
                                    depth_2++;
                                    //save drilldown call if not drilling to switch
                                    if(!switchCall){points_drilled.push(copyPoint);}
                                }
                                else {
                                    //first drilldown call on category click
                                    if (categoryPressed === false){
                                        categoryPressed = true;
                                        numCategories = this.series.length;
                                    }
                                    //check if its the last category call 
                                    if (numCategories === 1){
                                        numCategories--;
                                        depth_2++;

                                        //save drilldown on last category call if not drilling to switch
                                        copyPoint.category = true;
                                        if(!switchCall){points_drilled.push(copyPoint);}
                                    }
                                    //numCategories > 1 (mid calls so do nothing)
                                    else {
                                        numCategories--;
                                    }
                                }
                                //instantiate necessary date variables
                                var oneDay = 86400000;
                                var pointDate = new Date(e.point.x+oneDay);
                                var pointYear = pointDate.getFullYear();
                                var pointMonth = pointDate.getMonth();
                                //check for leap year
                                var isLeapYear = !(pointYear % 4) && (pointYear % 100) || !(pointYear % 400);
                                var daysInMonths = [0,31,28,31,30,31,30,31,31,30,31,30,31];
                                //if leap year correct february
                                if (isLeapYear) daysInMonths[2] = 29;
                                //drill from first graph
                                if (depth_2 === 1){
                                    var nextMonth = e.point.x; 

                                    //if its a normall drilldown
                                    if (categoryPressed === false){
                                        var seriesNum;
                                        //if HG then do only HG
                                        if (type === 'HG'){
                                            seriesNum = 0;
                                            drillColors = hg_colors;
                                            series0.name = drillNames_1[0];
                                        }
                                        else if (type === 'HY'){
                                            seriesNum = 1;
                                            drillColors = hy_colors;
                                            series0.name = drillNames_1[1];
                                        }
                                        else {
                                            console.log("Error: Invalid type for drilldown.");
                                        }
                                        for (var i = 0; i < 12; i++){
                                            nextMonth = nextMonth + (oneDay*daysInMonths[i]);
                                            if (drillDowns_1.series[nextMonth+"_"+seriesNum]){
                                                series0.data.push({ x: drillDowns_1.series[nextMonth+"_"+seriesNum].data[0].x,
                                                                    y: drillDowns_1.series[nextMonth+"_"+seriesNum].data[0].y     });
                                                }
                                        }
                                        drillSeries = [series0];
                                    }
                                    //if its the final categpory call
                                    //drill to all series
                                    else if (numCategories === 0 && categoryPressed){
                                        for (var i = 0; i < 12; i++){
                                            nextMonth += (oneDay*daysInMonths[i]);
                                            if (drillDowns_1.series[nextMonth+"_0"]){
                                                series0.data.push({x: drillDowns_1.series[nextMonth+"_0"].data[0].x,
                                                                   y: drillDowns_1.series[nextMonth+"_0"].data[0].y     });
                                                series1.data.push({x: drillDowns_1.series[nextMonth+"_1"].data[0].x,
                                                                   y: drillDowns_1.series[nextMonth+"_1"].data[0].y     });
                                            }
                                        }
                                        series0.name = drillNames_1[0];
                                        series1.name = drillNames_1[1];
                                        drillSeries = [series0, series1];
                                        drillColors = colorSet;
                                        //reset categoryPressed bool
                                        categoryPressed = false;
                                    }
                                    //if category is pressed and we are mid calls
                                    //do nothing
                                    //update x-axis labeling
                                    this.xAxis[0].update(xAxis_monthly);
                                    //show switch button
                                    $('#annual_trace_volume_hghy_1_btn').toggle(true);
                                }
                                //drilling from second graph
                                else if (depth_2 === 2){
                                    var firstDay = e.point.x;
                                    //86400000 == one day in UTC
                                    var nextDay;
                                    var numDays = daysInMonths[pointMonth+1];
                                    //if its a normall drilldown or category call on single series
                                    if (categoryPressed === false || (categoryPressed && (this.series.length === 1))){
                                        var seriesNum;
                                        //if HG then do only HG
                                        if (type === 'HG'){
                                            seriesNum = 0;
                                            drillColors = hg_colors;
                                            series0.name = drillNames_2[0];
                                        }
                                        else if (type === 'HY'){
                                            seriesNum = 1;
                                            drillColors = hy_colors;
                                            series0.name = drillNames_2[1];
                                        }
                                        else {
                                            console.log("Error: Invalid type for drilldown.");
                                        }
                                        for (var i = 0; i < numDays; i++){
                                           nextDay = firstDay + (i*oneDay);
                                           if (drillDowns_2.series[nextDay+"_"+seriesNum]){
                                                series0.data.push({  x: drillDowns_2.series[nextDay+"_"+seriesNum].data[0].x,
                                                                     y: drillDowns_2.series[nextDay+"_"+seriesNum].data[0].y     });
                                                }
                                        }
                                        //if category call reset boolean
                                        if (categoryPressed) categoryPressed = false;
                                        drillSeries = [series0];
                                    }
                                    //if its the final categpory call
                                    //drill to all series
                                    else if (numCategories === 0 && categoryPressed){
                                        for (var i = 0; i < numDays; i++){
                                            nextDay = firstDay + (i*oneDay);
                                            if (drillDowns_2.series[nextDay+"_0"]){
                                                series0.data.push({x: drillDowns_2.series[nextDay+"_0"].data[0].x,
                                                                   y: drillDowns_2.series[nextDay+"_0"].data[0].y     });
                                                series1.data.push({x: drillDowns_2.series[nextDay+"_1"].data[0].x,
                                                                   y: drillDowns_2.series[nextDay+"_1"].data[0].y     });
                                            }
                                        }
                                        series0.name = drillNames_1[0];
                                        series1.name = drillNames_1[1];
                                        drillSeries = [series0, series1];
                                        drillColors = colorSet;
                                        //reset categoryPressed bool
                                        categoryPressed = false;
                                    }
                                    //if category is pressed and we are mid calls
                                    //do nothing

                                    //update x-axis labeling
                                    this.xAxis[0].update(xAxis_daily);
                                    //show switch button
                                    $('#annual_trace_volume_hghy_1_btn').toggle(true);
                                }
                                //drilling from third graph
                                else if (depth_2 == 3){
                                    //if normal call or category call on a single series 
                                    if (categoryPressed === false || (categoryPressed && (this.series.length === 1))){
                                        //check which type of series was called
                                        if (type === 'HG'){
                                            drillSeries = [drillDowns_3.series[e.point.x + "_0"],drillDowns_3.series[e.point.x + "_1"],drillDowns_3.series[e.point.x + "_2"]];
                                            drillColors = hg_colors;
                                        }
                                        else if (type === 'HY'){
                                            drillSeries = [drillDowns_3.series[e.point.x + "_3"],drillDowns_3.series[e.point.x + "_4"],drillDowns_3.series[e.point.x + "_5"]];
                                            drillColors = hy_colors;
                                        }
                                        else {console.log("Error: Invalid type for drilldown.")}
                                        //if category call reset boolean
                                        if (categoryPressed) categoryPressed = false;
                                    }
                                    //if category call with multiple series 
                                    else if (numCategories === 0 && categoryPressed){
                                        drillSeries = [drillDowns_3.series[e.point.x + "_0"],drillDowns_3.series[e.point.x + "_1"],drillDowns_3.series[e.point.x + "_2"],drillDowns_3.series[e.point.x + "_3"],drillDowns_3.series[e.point.x + "_4"],drillDowns_3.series[e.point.x + "_5"]];
                                        categoryPressed = false;
                                        drillColors = hg_colors.concat(hy_colors);
                                    }
                                    this.xAxis[0].update(xAxis_monthly);

                                    //set max width for stacked columns
                                    for (var i = 0; i < drillSeries.length; i++){
                                        drillSeries[i].maxPointWidth = 200;

                                    }
                                    //show switch button
                                    $('#annual_trace_volume_hghy_1_btn').toggle(true);
                                }
                                else {
                                    //depth_2 error
                                    console.log("Category Call.");
                                }
                                //set colors and set as drillable
                                for (var i = 0; i < drillSeries.length; i++){
                                    drillSeries[i].color = drillColors[i];
                                    if (depth_2 != depthLimit){
                                        for (var j = 0; j < drillSeries[0].data.length; j++){
                                            drillSeries[i].data[j].drilldown = true;
                                        }
                                    }
                                    //if not on initial chart set type of chart to column
                                    if (depth_2 != 0){
                                        drillSeries[i].type = 'column';
                                    }
                                    this.addSingleSeriesAsDrilldown(e.point, drillSeries[i]);
                                }
                                //do not add to drill up calls if mid category calls
                                if (!categoryPressed){
                                    drillup_calls.push(drillSeries.length);
                                }
                                //apply the drilldown
                                this.applyDrilldown();

                                //if switch button isn't created make it
                                if (!this.switchToSideBySide){
                                    makeSwtichButton();
                                }
                                //else display it
                                else {
                                    this.switchToSideBySide.show();
                                }
                            }
                        },
                        drillup: function(e){
                            //if on last call then decrement depth_2 and remove its instance
                            if (drillup_calls[drillup_calls.length-1] === 1){
                                depth_2--;
                                //remove drillup call instance 
                                drillup_calls = drillup_calls.slice(0,drillup_calls.length-1);
                                //update axis to fix drilled up chart
                                switch (depth_2) {
                                    case 1:
                                        this.xAxis[0].update(xAxis_monthly);
                                        break;
                                    case 2:
                                        this.xAxis[0].update(xAxis_daily);
                                        break;
                                    case 3:
                                        this.xAxis[0].update(xAxis_monthly);
                                        break;
                                    default:
                                        this.xAxis[0].update(xAxis_yearly);
                                        //hide switch button
                                        $('.chart-btn').toggle(false);
                                        if (this.switchToSideBySide) {this.switchToSideBySide.hide()};

                                }

                                //delete saved drillpoint
                                //if not drilling up to switch
                                if (!switchCall){
                                    points_drilled = points_drilled.slice(0, points_drilled.length - 1);
                                }
                            }
                            else {
                                drillup_calls[drillup_calls.length-1]--;
                            }
                        }
                    }
                },

                //set title 
                title: {
                    text: 'TRACE Stacked Annual Flow',
                    style: {
                        color: '#4D759E'
                    },
                    align: 'center'
                },
                //set subtitle
                subtitle: {
                    text: "Click on data or a category for more information"
                },
                //set x-axis 
                xAxis: [{
                    title: {
                        text: 'Date',
                        style: {
                            color: '#4D759E',
                            fontWeight: 'bold'
                        }
                    },
                    gridLineWidth: 1,
                    type: 'datetime',
                    tickInterval: (24 * 3600 * 1000 * 365),
                    labels: {
                        align: 'center',
                        y: 11
                    }
                }],
                //set y-axis 
                yAxis: {
                    title: {
                        text: 'TRACE Annual Flow ( Billions USD )',
                        style: {
                            color: '#4D759E',
                            fontWeight: 'bold'
                        }
                    },
                    labels: {
                        formatter: function () {
                            return Highcharts.numberFormat(this.value, 0, '', ',');
                        }
                    }
                },
                //set tooltip       
                tooltip: {
                    valuePrefix: '$',
                    valueSuffix: ' Billion',
                    valueDecimals: 2,
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
                },
                //set legend
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    borderWidth: 1,
                    borderRadius: 5
                },
                //instantiate series
                series: [],
                //instantiate drilldown
                drilldown: {
                    series: []
                },
                //set colors for series
                colors: ['#002244', '#DBBB33', '#639741', '#43C5F3'],
                //set general plot options
                plotOptions: {
                    column: {
                        pointPadding: 0,
                        borderWidth: 0,
                        //have colums next to each other rather than stack
                        stacking: 'normal'
                    },
                    line: {
                        //make data label markers always a circle
                        marker: {
                            symbol: 'circle'
                        }
                    }
                },
                //set name of chart downloads
                exporting: {
                    filename: 'MarketAxess_annual_trace_volume_hghy',
                    //enable download icon
                    enabled: true,
                    //add image to download 
                    chartOptions: {
                        chart: {
                            events: {
                                load: function () {
                                    this.renderer.image('http://www.marketaxess.com/images/marketaxess_logo2.gif', 90, 75, 300, 48).attr({
                                        opacity: 0.1
                                        }).add();
                                }
                            }
                        }
                    }
                },
                //disable credits
                credits: {
                    enabled: false
                }
            };
            //names of labels in order of series
            var names = ['HG Annual Flow', 'HY Annual Flow'];
            //get csv file, divide by 1 billion and populate chart
            readCSV(options_2, data, 1000000000, names);

            //make all datable drill-able
            for (var i = 0; i < options_2.series.length; i++){
                for (var j = 0; j < options_2.series[i].data.length; j++){
                    options_2.series[i].data[j].drilldown = true;
                }
            }

            chart_2 = new Highcharts.Chart(options_2);

            //function to make button in chart
            function makeSwtichButton(){
                chart_2.switchToSideBySide = chart_2.renderer.button('See this Data Side by Side',150, 81, function() {},
                    {
                        //normal state
                         zIndex: 3
                    }, 
                    { //hover state 
                    }
                    ).on('click', function () { 
                        switchCall = true;
                            
                        $('.chart_container').toggle(false);
                        $('#annual_trace_volume_hghy_1_container').toggle(true);
                        $('#annual_trace_volume_hghy_1_container').highcharts().destroy();
                         //reset chart
                         chart_1 = new Highcharts.Chart(options_1);
                         chart_1.xAxis[0].update(xAxis_yearly);
                         depth_1 = 0;

                         //do normal drill down 
                         for (var i = 0; i < points_drilled.length; i++){
                             point = points_drilled[i];
                             if (point.category){categoryPressed = true;}
                             //apply drilldown based on which chart it is switching to 
                             chart_1.series[point.seriesIndex].data[point.pointIndex].doDrilldown();
                        }
                        switchCall = false;

                    }).add();
            }

        })
            //if fails display error 
            .fail(function (jqxhr_annual_trace_hghy_2, exception) {
                ajaxError(jqxhr_annual_trace_hghy_2, exception, '#annual_trace_volume_hghy_2_container');
        });
    }


    //set high level chart options for all charts
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });



    $('.chart_container').toggle(false);
    annual_trace_hghy_chart();
    annual_trace_hghy_chart_2();
    $('#annual_trace_volume_hghy_1_container').toggle(true);

})();


