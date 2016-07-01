//assign all buttons
function auto_assign_toggle_chart_buttons() {
    $(".chart-btn").each(function () {
        $(this).click(function () {
            //get chart name from data-chart tag
            var chartName = $(this).data('chart');
            $('.chart_container').toggle(false);
            $('#' + chartName + '_container').toggle(true);
        });
    });
};


//function to parse, scale and add data from csv file
function readCSV(options, data, scale, names) {
    //split csv by lines
    var allLines = data.split('\n');
    //if in YYYY-mm-dd then 0, if YYYY-mm then 1,  if in mm/dd/YYYY then 2
    var utcFormat = 0;
    //iterate through each line
    $.each(allLines, function (lineNo, line) {
        var items = line.split(',');
        //set names of data
        if (lineNo === 0) {
            //make sure series is defined 
            options.series = [];
            //loop through first line to instantiate and name series
            $.each(items, function (itemNo, item) {
                if (itemNo > 0) {
                    options.series.push({
                        name: names[itemNo - 1],
                        data: []
                    });
                }
            });
        } else {
            var date = [];
            $.each(items, function (itemNo, item) {
                //first set date associated with points
                if (itemNo === 0) {
                    //split date into day, month, year
                    date = item.trim().split(/[./-]/);
                    if (lineNo == 1) { 
                        var dateFormat = date[0].length;
                        //check if it is in YYYY-mm format
                        if (date.length === 2){
                            utcFormat = 1;
                        }
                        //if in mm/dd/YYYY then 1
                        else if (dateFormat < 4){
                            utcFormat = 2;
                        }
                    }
                } else {
                    //if item is NA or 0 do not add to series! (NOTE keep != 0 do not put !== 0) 
                    if ( (item.trim() != 'NA') && (item != 0)) {
                        //add data to respective series
                        //YYYY-mm-dd
                        if (utcFormat === 0){
                            options.series[itemNo - 1].data.push({ x: Date.UTC(date[0], date[1] - 1, date[2]), 
                                                                   y: (parseFloat(item) / scale)                                                                    });
                        }
                        //YYYY-mm
                        else if (utcFormat === 1){
                            options.series[itemNo - 1].data.push({ x: Date.UTC(date[0], date[1] - 1),
                                                                   y: (parseFloat(item) / scale)                                                                    });
                        }
                        //mm/dd/YYY
                        else{
                            options.series[itemNo - 1].data.push({  x: Date.UTC(date[2], date[0] - 1, date[1]), 
                                                                    y: (parseFloat(item) / scale)
                                                                    });
                        }
                    }
                }
            });
        }
    });
}


//function to parse, scale and add data from csv file
function readTimeCSV(options, data, scale, names) {
    //split csv by lines
    var allLines = data.split('\n');
    //if in YYYY-mm-dd then 0, if YYYY-mm then 1,  if in mm/dd/YYYY then 2
    var utcFormat = 0;
    //iterate through each line
    $.each(allLines, function (lineNo, line) {
        var items = line.split(',');
        //set names of data
        if (lineNo === 0) {
            //make sure series is defined 
            options.series = [];
            //loop through first line to instantiate and name series
            $.each(items, function (itemNo, item) {
                if (itemNo > 0) {
                    options.series.push({
                        name: names[itemNo - 1],
                        data: []
                    });
                }
            });
        } else {
            var date = [];
            $.each(items, function (itemNo, item) {
                //first set date associated with points
                if (itemNo === 0) {
                    //split date into day, month, year
                    date = item.trim().split(/[./-\s:]/);
                    if (lineNo == 1) { 
                        var dateFormat = date[0].length;
                        //check if it is in YYYY-mm format
                        if (date.length === 2){
                            utcFormat = 1;
                        }
                        //if in hh:mm:ss
                        else if (date.length === 6 || date.length === 5){
                            //mm/dd/YYYY
                            if (dateFormat < 4){
                                utcFormat = 3;
                            }
                            else {
                                utcFormat = 4;
                            }
                        }
                        //if in mm/dd/YYYY then 1
                        else if (dateFormat < 4){
                            utcFormat = 2;
                        }
                    }
                } else {
                    //if item is NA or 0 do not add to series! (NOTE keep != 0 do not put !== 0) 
                    if ( (item.trim() != 'NA') ) {
                        //add data to respective series
                        //YYYY-mm-dd
                        if (utcFormat === 0){
                            options.series[itemNo - 1].data.push({ x: Date.UTC(date[0], date[1] - 1, date[2]), 
                                                                   y: (parseFloat(item) / scale)                                                                    });
                        }
                        //YYYY-mm
                        else if (utcFormat === 1){
                            options.series[itemNo - 1].data.push({ x: Date.UTC(date[0], date[1] - 1),
                                                                   y: (parseFloat(item) / scale)                                                                    });
                        }
                        //mm/dd/YYYY
                        else if (utcFormat === 2){
                            options.series[itemNo - 1].data.push({  x: Date.UTC(date[2], date[0] - 1, date[1]), 
                                                                    y: (parseFloat(item) / scale)
                                                                    });
                        }
                        //mm/dd/YYYY HH:mm:ss
                        else if (utcFormat === 3){
                            if ( (date[3] >= 7 && date[3] <= 20) || (date[3] == 21 && date[4] == 0)){
                                options.series[itemNo - 1].data.push({  x: Date.UTC(date[2], date[0] - 1, date[1], date[3], date[4]), 
                                                                        y: (parseFloat(item) / scale)
                                                                        });
                            }
                        }
                        //YYYY-mm-dd HH:mm:ss
                        else if (utcFormat === 4){
                            if ( (date[3] >= 7 && date[3] <= 20) || (date[3] == 21 && date[4] == 0)){
                                options.series[itemNo - 1].data.push({  x: Date.UTC(date[0], date[1] - 1, date[2], date[3], date[4]), 
                                                                        y: (parseFloat(item) / scale)
                                                                        });
                            }
                        }
                    }
                }
            });
        }
    });
}

//function to parse, scale and add data from csv file
function readCategoryCSV(options, data, scale, names) {
    //split csv by lines
    var allLines = data.split('\n');
    //if in YYYY-mm-dd then 0, if YYYY-mm then 1,  if in mm/dd/YYYY then 2
    var utcFormat = 0;
    //iterate through each line
    $.each(allLines, function (lineNo, line) {
        var items = line.split(',');
        //set names of data
        if (lineNo === 0) {
            //make sure series is defined 
            options.series = [];
            //loop through first line to instantiate and name series
            $.each(items, function (itemNo, item) {
                if (itemNo > 0) {
                    options.series.push({
                        name: names[itemNo - 1],
                        data: []
                    });
                }
            });
        } else {
            var currentCategory ;
            $.each(items, function (itemNo, item) {
                if (itemNo != 0) {
                    //if item is NA  do not add to series! 
                    if ( (item.trim() != 'NA')) {
                        //add data to respective series
                        options.series[itemNo - 1].data.push({  y: (parseFloat(item) / scale)});
                    }
                }
            });
        }
    });
}


//function to parse, scale and add data from csv file
function readDrilldownCSV(options, data, scale, names) {
    //split csv by lines
    var allLines = data.split('\n');
    //if in YYYY-mm-dd then 0, if YYYY-mm then 1,  if in mm/dd/YYYY then 2
    var utcFormat = 0;
    //iterate through each line
    $.each(allLines, function (lineNo, line) {
        var items = line.split(',');
        //set names of data
        if (lineNo === 0) {
            //make sure series is defined 
            options.series = [];

        } else {
            var date = [];
            $.each(items, function (itemNo, item) {
                //first set date associated with points
                if (itemNo === 0) {
                    //split date into day, month, year
                    date = item.trim().split(/[./-]/);
                    if (lineNo == 1) { 
                        var dateFormat = date[0].length;
                        //check if it is in YYYY-mm format
                        if (date.length === 2){
                            utcFormat = 1;
                        }
                        //if in mm/dd/YYYY then 1
                        else if (dateFormat < 4){
                            utcFormat = 2;
                        }
                    }
                } else {
                    //if item is NA or 0 do not add to series! (NOTE keep != 0 do not put !== 0) 
                    if ( (item.trim() != 'NA') && (item != 0)) {
                        //add data to respective series

                        //add data based on date to series 

                        //YYYY-mm-dd
                        if (utcFormat === 0){
                            if (!options.series[Date.UTC(date[0], date[1] - 1, date[2])+"_"+(itemNo - 1)]){
                                options.series[Date.UTC(date[0], date[1] - 1, date[2])+"_"+(itemNo - 1)] = {
                                    name: names[itemNo - 1],
                                    data: []
                                };
                            }
                            options.series[Date.UTC(date[0], date[1] - 1, date[2])+"_"+(itemNo - 1)].data.push(
                                                                                                                {   x: Date.UTC(date[0], date[1] - 1, date[2]), 
                                                                                                                    y: (parseFloat(item) / scale)
                                                                                                                });
                        }
                        //YYYY-mm
                        else if (utcFormat === 1){
                            if (!options.series[Date.UTC(date[0], date[1] - 1)+"_"+(itemNo - 1)]){
                                options.series[Date.UTC(date[0], date[1] - 1)+"_"+(itemNo - 1)] = {
                                    name: names[itemNo - 1],
                                    data: []
                                };
                            }
                            options.series[Date.UTC(date[0], date[1] - 1)+"_"+(itemNo - 1)].data.push(
                                                                                                    {   x: Date.UTC(date[0], date[1] - 1),
                                                                                                        y: (parseFloat(item) / scale),
                                                                                                    });
                        }
                        //mm/dd/YYY
                        else{
                            if (!options.series[Date.UTC(date[2], date[0] - 1, date[1])+"_"+(itemNo - 1)]){
                                options.series[Date.UTC(date[2], date[0] - 1, date[1])+"_"+(itemNo - 1)] = {
                                    name: names[itemNo - 1],
                                    data: []
                                };
                            }
                            options.series[Date.UTC(date[2], date[0] - 1, date[1])+"_"+(itemNo - 1)].data.push(
                                                                                                                {   x: Date.UTC(date[2], date[0] - 1, date[1]), 
                                                                                                                    y: (parseFloat(item) / scale),
                                                                                                                });
                        }
                    }
                }
            });
        }
    });
}

