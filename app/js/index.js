$(function () {

    var Index = {};

    var recordPerPage = 10;

    Index.setServiceList = function (rows) {
        var $table = $('#tblList > tbody');
        $table.empty();

        if (rows.length) {
            _.forEach(rows, function (v) {
                var html = [
                    '<tr>',
                    '<td>'+ moment(v.vstdate).format('DD/MM/YYYY') +'</td>',
                    '<td>'+ v.hn +'</td>',
                    '<td>'+ v.pname + v.fname + ' ' + v.lname + '</td>',
                    '<td>'+ v.pttype + ' - ' + v.pttype_name +'</td>',
                    '<td>'+ v.icd10 + ' - ' + v.diag_name +'</td>',
                    '</tr>'
                ].join('');

                $table.append(html);
            });
        } else {
            $table.append('<tr><td colspan="5">ไม่พบรายการ</td></tr>')
        }
    };

    Index.getService = function (start, end, s, cb) {

        var db = getConnection();

        db('ovst as o')
            .select('o.vstdate', 'o.hn', 'p.cid', 'p.fname', 'p.lname',
                'o.pttype', 'p.pname', 'pt.name as pttype_name', 'od.icd10',
                'icd.name as diag_name')
            .innerJoin('patient as p', 'p.hn', 'o.hn')
            .leftJoin('pttype as pt', 'pt.pttype', 'o.pttype')
            .leftJoin('ovstdiag as od', 'od.vn', 'o.vn')
            .leftJoin('icd101 as icd', 'icd.code', 'od.icd10')
            .whereRaw('od.diagtype="1"')
            .whereBetween('o.vstdate', [start, end])
            .limit(recordPerPage)
            .offset(s)
            .orderBy('o.vstdate', 'asc')
            .then(function (rows) {
                cb(null, rows);
            })
            .catch(function (err) {
                cb(err);
            });

    };

    Index.getTotal = function (start, end, cb) {
        var db = getConnection();

        db('ovst as o')
            .count('* as total')
            .innerJoin('patient as p', 'p.hn', 'o.hn')
            .whereBetween('o.vstdate', [start, end])
            .then(function (rows) {
                cb(null, rows[0].total);
            })
            .catch(function (err) {
                cb(err);
            });
    }

    $('#btnSearch').on('click', function (e) {
        e.preventDefault();

        var start = $('#txtStartDate').val(),
            end = $('#txtEndDate').val();

        Index.getTotal(start, end, function (err, total) {

            $("#paging").paging(total, {
                format: "< . (qq -) nnncnnn (- pp) . >",
                perpage: recordPerPage,
                lapping: 0,
                page: 1,
                onSelect: function (page) {

                    var startRecord = this.slice[0];

                    Index.getService(start, end, startRecord, function (err, rows) {
                        if (err) console.log(err);
                        else Index.setServiceList(rows);
                    });
                },
                onFormat: function (type) {
                    switch (type) {
                        case 'block':

                            if (!this.active)
                                return '<li class="disabled"><a href="">' + this.value + '</a></li>';
                            else if (this.value != this.page)
                                return '<li><a href="#' + this.value + '">' + this.value + '</a></li>';
                            return '<li class="active"><a href="#">' + this.value + '</a></li>';

                        case 'right':
                        case 'left':

                            if (!this.active) {
                                return "";
                            }
                            return '<li><a href="#' + this.value + '">' + this.value + '</a></li>';

                        case 'next':

                            if (this.active) {
                                return '<li><a href="#' + this.value + '">&raquo;</a></li>';
                            }
                            return '<li class="disabled"><a href="">&raquo;</a></li>';

                        case 'prev':

                            if (this.active) {
                                return '<li><a href="#' + this.value + '">&laquo;</a></li>';
                            }
                            return '<li class="disabled"><a href="">&laquo;</a></li>';

                        case 'first':

                            if (this.active) {
                                return '<li><a href="#' + this.value + '">&lt;</a></li>';
                            }
                            return '<li class="disabled"><a href="">&lt;</a></li>';

                        case 'last':

                            if (this.active) {
                                return '<li><a href="#' + this.value + '">&gt;</a></li>';
                            }
                            return '<li class="disabled"><a href="">&gt;</a></li>';

                        case 'fill':
                            if (this.active) {
                                return '<li class="disabled"><a href="#">...</a></li>';
                            }
                    }
                    return ""; // return nothing for missing branches
                    }
            });
        });


    })

    // Get service
    var start = moment().format('YYYY-MM-DD'),
        end = moment().format('YYYY-MM-DD');

    Index.getService(start, end, 1, function (err, rows) {
        if (err) console.log(err);
        else Index.setServiceList(rows);
    });
});
