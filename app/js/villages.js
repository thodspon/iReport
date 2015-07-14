
$(function () {

    var Villages = {};

    Villages.getList = function (cb) {
        var db = getConnection();

        db('village')
            .select()
            .orderBy('village_code')
            .then(function (rows) {
                cb(null, rows);
            })
            .catch(function (err) {
                cb(err);
            });
    };

    Villages.getHouseList = function (village_id, cb) {
        var db = getConnection();

        db('house')
            .select('house_id', 'address', 'census_id', 'latitude', 'longitude')
            .where('village_id', village_id)
            .orderBy('address')
            .then(function (rows) {
                cb(null, rows);
            })
            .catch(function (err) {
                cb(err);
            });
    };


    Villages.setVillageList = function (rows) {
        var $table = $('#tblList > tbody');
        // Clear all row
        $table.empty();

        if (rows.length) {
            _.forEach(rows, function (v) {
                var html = [
                    '<tr>' +
                    '<td>'+ v.village_code +'</td>' +
                    '<td>'+ v.village_moo +'</td>' +
                    '<td>'+ v.village_name +'</td>' +
                    '<td><button class="btn btn-success" data-name="btnGetHouse" data-id="'+ v.village_id + '">' +
                    '<span class="fa fa-pencil"></span>' +
                    '</button></td>' +
                    '</tr>'
                ].join('');

                $table.append(html);
            });
        } else {
            var html = '<tr><td colspan="3">ไม่พบรายการ</td></tr>';
            $table.append(html);
        }
    };

    Villages.setHouseList = function (rows) {
        var $table = $('#tblHouseList > tbody');
        // Clear all row
        $table.empty();

        if (rows.length) {
            var i = 0;
            _.forEach(rows, function (v) {
                i++;

                var html = [
                    '<tr>',
                    '<td>'+ i +'</td>',
                    '<td>'+ v.address +'</td>',
                    '<td>'+ v.census_id +'</td>',
                    '<td>'+ v.latitude +'</td>',
                    '<td>'+ v.longitude +'</td>',
                    '<td><button class="btn btn-primary" ',
                    'data-lat="'+ v.latitude + '" data-lng="'+ v.longitude +'" ',
                    'data-name="btnSetMap" data-id="'+ v.house_id + '">',
                    '<span class="fa fa-map-marker"></span>',
                    '</button></td>',
                    '</tr>'
                ].join('');

                $table.append(html);
            });
        } else {
            var html = '<tr><td colspan="6">ไม่พบรายการ</td></tr>';
            $table.append(html);
        }
    };

    Villages.getList(function (err, rows) {
        if (err) console.log(err);
        else Villages.setVillageList(rows);
    });

    Villages.saveMap = function (houseId, lat, lng, cb) {
        var db = getConnection();

        db('house')
            .update({
                latitude: lat,
                longitude: lng
            })
            .where('house_id', houseId)
            .then(function () {
                cb(null);
            })
            .catch(function (err) {
                cb(err);
            })
    };

    $(document).on('click', 'button[data-name="btnGetHouse"]', function (e) {
        e.preventDefault();

        var village_id = $(this).data('id');

        $('#txtVillageId').val(village_id);

        Villages.getHouseList(village_id, function (err, rows) {
            if (err) console.log(err);
            else Villages.setHouseList(rows);
        });
    });

    $(document).on('click', 'button[data-name="btnSetMap"]', function (e) {
        e.preventDefault();

        var houseId = $(this).data('id'),
            lat = $(this).data('lat'),
            lng = $(this).data('lng');

        $('#txtLat').val(lat);
        $('#txtLng').val(lng);

        $('#txtHouseId').val(houseId);
        console.log(houseId);
        $('#mdlSetMap').modal({backdrop: 'static'});

    });

    // Google map
    var map;
    var markers = [];

    var addMarker = function (latLng) {

        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            draggable: false,
            animation: google.maps.Animation.DROP
        });

        markers.push(marker);

    };

    var clearMarkers = function () {
        for (var i=0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    };


    $('#mdlSetMap').on('shown.bs.modal', function () {
        google.maps.event.trigger(map, "resize");

        var lat = $('#txtLat').val(),
            lng = $('#txtLng').val();

        if (lat && lng) {
            var latLng = new google.maps.LatLng(lat, lng);
            addMarker(latLng);
            map.setCenter(latLng);
        }
    });

    $('#mdlSetMap').on('hidden.bs.modal', function () {
        $('#txtHouseId').val('');
        clearMarkers();
    });

    // Save map
    $('#btnDoSave').on('click', function (e) {
        e.preventDefault();

        var lat = $('#txtLat').val(),
            lng = $('#txtLng').val(),
            houseId = $('#txtHouseId').val();

        Villages.saveMap(houseId, lat, lng, function (err) {
            if (err) {
                console.log(err);
                alert('เกิดข้อผิดพลาด');
            } else {

                var village_id = $('#txtVillageId').val();

                Villages.getHouseList(village_id, function (err, rows) {
                    if (err) console.log(err);
                    else Villages.setHouseList(rows);
                });

                $('#mdlSetMap').modal('hide');
            }
        });
    });

    function initialize() {

        map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            center: {lat: 16.2015035, lng: 103.2837399}
        });

        // event
        google.maps.event.addListener(map, 'click', function(e) {

            // clear all markers
            clearMarkers();
            //map.setCenter(e.latLng);
            //console.log(e.latLng);
            $('#txtLat').val(e.latLng.A);
            $('#txtLng').val(e.latLng.F);
            addMarker(e.latLng);
        });
    }

    google.maps.event.addDomListener(window, 'load', initialize);


});