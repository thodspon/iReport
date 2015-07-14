$(function () {

    var columnChartOption = {
        chart: {
            type: 'column'
        },
        title: {
            text: '10 อันดับโรคสูงสุด'
        },
        xAxis: {
            //categories: ['Apples', 'Bananas', 'Oranges']
            categories: []
        },
        yAxis: {
            title: {
                text: 'จำนวนครั้งที่รับบริการ'
            }
        },
        series: [
            {
                name: "ครั้ง",
                data: []
            }
        ]
    };

    var pieChartOption = {
         chart: {
             plotBackgroundColor: null,
             plotBorderWidth: null,
             plotShadow: false
         },
         title: {
             text: 'สถิติรับบริการแยกรายสิทธ์'
         },
         tooltip: {
             pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
         },
         plotOptions: {
             pie: {
                 allowPointSelect: true,
                 cursor: 'pointer',
                 dataLabels: {
                     enabled: true,
                     format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                     style: {
                         color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                     }
                 }
             }
         },
         series: [{
            type: 'pie',
            name: 'สถิติแยกรายสิทธิ์',
            data: [
                //['Firefox',   45.0]
            ]
         }]
     };


    var Reports = {};

    Reports.getTopTen = function (start, end, cb) {
        var db = getConnection();

        var sql = 'select o.icd10, icd.name as diag_name, count(distinct o.vn) as total ' +
            'from ovstdiag as o ' +
            'left join icd101 as icd on icd.code=o.icd10 '+
            'where o.vstdate between ? and ? ' +
            'and o.diagtype="1"' +
            'group by o.icd10 ' +
            'order by total desc ' +
            'limit 10';

        db.raw(sql, [start, end])
            .then(function (rows) {
                cb(null, rows[0]);
            })
            .catch(function (err) {
                cb(err);
            });
    };

    Reports.getTopTenPttype = function (start, end, cb) {
        var db = getConnection();

        var sql = 'select pttype.pttype, pttype.name as pttype_name, count(o.vn) as total ' +
            'from ovst as o ' +
            'left join pttype on pttype.pttype=o.pttype ' +
            'where o.vstdate between ? and ? ' +
            'group by o.pttype ' +
            'order by total desc ' +
            'limit 10';

        db.raw(sql, [start, end])
            .then(function (rows) {
                cb(null, rows[0]);
            })
            .catch(function (err) {
                cb(err);
            });
    };

    $('#btnProcess').on('click', function (e) {
        e.preventDefault();

        var start = $('#txtStartDate').val();
        var end = $('#txtEndDate').val();

        Reports.getTopTen(start, end, function (err, rows) {
            if (err) console.log(err);
            else {

                var $table = $('#tblTopTenList>tbody');
                $table.empty();

                var i = 0;
                // Clear old data
                columnChartOption.xAxis.categories = [];
                columnChartOption.series[0].data = [];

                _.forEach(rows, function (v) {
                    i++;
                    var html = [
                        '<tr>',
                        '<td>'+ i +'</td>',
                        '<td>'+ v.icd10 +' - ' + v.diag_name +'</td>',
                        '<td>'+ v.total +'</td>',
                        '</tr>'
                    ].join('');

                    $table.append(html);

                    columnChartOption.xAxis.categories.push(v.icd10);
                    columnChartOption.series[0].data.push(v.total);
                });

                $('#charts').highcharts(columnChartOption);
            }
        });

        Reports.getTopTenPttype(start, end, function (err, rows) {
            if (err) console.log(err);
            else {

                var $table = $('#tblTopTenPttypeList > tbody');
                $table.empty();

                var i = 0;
                // Clear old data
                pieChartOption.series[0].data = [];

                _.forEach(rows, function (v) {
                    i++;
                    var html = [
                        '<tr>',
                        '<td>'+ i +'</td>',
                        '<td>'+ v.pttype +' - ' + v.pttype_name +'</td>',
                        '<td>'+ v.total +'</td>',
                        '</tr>'
                    ].join('');

                    $table.append(html);

                    var data = [];
                    data[0] = v.pttype;
                    data[1] = v.total;
                    pieChartOption.series[0].data.push(data);
                });

                $('#pieChart').highcharts(pieChartOption);
            }
        });

    });

});
