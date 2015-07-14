$(function () {

    // namespace
    var users = {};

    $('#btnNew').on('click', function (e) {
        $('#mdlNew').modal({ backdrop: 'static'});
    });

    // Edit
    $(document).on('click', 'button[data-name="btnEdit"]', function (e) {
        e.preventDefault();

        $('#txtStatus').val(1);
        $('#mdlNew').modal({ backdrop: 'static' });

    });

    // Refresh
    $('#btnRefresh').on('click', function (e) {
        e.preventDefault();

        users.list(function (err, rows) {
            if (err) console.log(err);
            else users.setList(rows);
        });
    });

    // Edit
    $(document).on('click', 'button[data-name="btnEdit"]', function (e) {
        e.preventDefault();
        $('#txtStatus').val(1);

        $('#txtUsername').val($(this).data('username')).prop('disabled', true);
        $('#txtPassword').val($(this).data('password'));

        $('#mdlNew').modal({backdrop: 'static'});
    });

    // Remove user
    $(document).on('click', 'button[data-name="btnRemove"]', function (e) {
        e.preventDefault();
        if (confirm('คุณต้องการลบรายการนี้ ใช่หรือไม่?')) {
            users.remove($(this).data('username'), function (err) {
                if (err) {
                    console.log(err);
                    alert('ไม่สามารถลบรายการได้');
                } else {
                    users.list(function (err, rows) {
                        if (err) console.log(err);
                        else users.setList(rows);
                    });
                }
            });
        }
    });

    // Search
    $('#btnSearch').on('click', function (e) {
        e.preventDefault();

        var query = $('#txtQuery').val();

        if(query) {
            users.search(query, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    users.setList(rows);
                }
            });
        }
    });

    // modal hide
    $('#mdlNew').on('hidden.bs.modal', function (e) {
        $('#txtUsername').val('').prop('disabled', false);
        $('#txtPassword').val('');
        $('#txtStatus').val(0);
    });

    // do save
    $('#btnDoSave').on('click', function (e) {
        e.preventDefault();
        var username = $('#txtUsername').val(),
            password = $('#txtPassword').val();

        var status = $('#txtStatus').val();

        if (!username || !password) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        } else {

            var crypto = require('crypto');
            var cryptoPass = crypto.createHash('md5').update(password).digest('hex');

            if (status == 1) {
                // Update
                users.update(username, cryptoPass, function (err) {
                    if (err) {
                        console.log(err);
                        alert('เกิดข้อผิดพลาดกรุณาดู log');
                    } else {
                        $('#mdlNew').modal('hide');
                        users.list(function (err, rows) {
                            if (err) console.log(err);
                            else users.setList(rows);
                        });
                    }
                });
            } else {
                // New
                users.save(username, cryptoPass, function (err) {
                    if (err) {
                        console.log(err);
                        alert('เกิดข้อผิดพลาดกรุณาดู log');
                    } else {
                        $('#mdlNew').modal('hide');
                        users.list(function (err, rows) {
                            if (err) console.log(err);
                            else users.setList(rows);
                        });
                    }
                });
            }

        }

    });


    // Do update user
    users.update = function (username, password, cb) {
        var db = getConnection();
        db('web_user')
            .where('user_name', username)
            .update({user_password: password})
            .then(function () {
                cb(null);
            })
            .catch(function (err) {
                cb(err);
            });
    };
    // Do remove user
    users.remove = function (username, cb) {
        var db = getConnection();
        db('web_user')
            .where('user_name', username)
            .delete()
            .then(function () {
                cb(null);
            })
            .catch(function (err) {
                cb(err);
            });
    };

    users.setList = function (rows) {
        var $table = $('#tblList > tbody');
        $table.empty();

        if (rows.length) {
            var i = 0;
            _.forEach(rows, function (v) {
                i++;
                var html = [
                    '<tr>',
                    '<td>' + i + '</td>',
                    '<td>' + v.user_name + '</td>',
                    '<td>',
                    '<div class="btn-group" role="group">',
                    '<button type="button" class="btn btn-default" data-name="btnEdit" ',
                    'data-username="'+ v.user_name +'" data-password="'+ v.user_password+'">',
                    '<span class="fa fa-pencil"></span></button>',
                    '<button type="button" data-username="' + v.user_name + '" ',
                    'data-name="btnRemove" class="btn btn-default">',
                    '<span class="fa fa-trash-o"></span></button>',
                    '</div>',
                    '</td>',
                    '</tr>'
                ].join('');

                $table.append(html);
            });
        } else {
            var html = '<tr><td colspan="3">ไม่พบรายการ</td></tr>';
            $table.append(html);
        }
    };

    users.save = function (username, password, cb) {
        var db = getConnection();

        db('web_user')
            .insert({
                user_name: username,
                user_password: password
            })
            .then(function () {
                cb(null);
            })
            .catch(function (err) {
                cb(err);
            });
    };

    users.list = function (cb) {
        var db = getConnection();
        db('web_user')
            .select('user_name')
            .orderBy('user_name', 'desc')
            .then(function (rows) {
                cb(null, rows);
            })
            .catch(function (err) {
                cb(err);
            });
    };

    users.search = function (query, cb) {
        var db = getConnection();

        db('web_user')
            .select('user_name')
            .where('user_name', 'like', '%' + query + '%')
            .orderBy('user_name', 'desc')
            .then(function (rows) {
                cb(null, rows);
            })
            .catch(function (err) {
                cb(err);
            });
    }

    // Get user list
    users.list(function (err, rows) {
        if (err) console.log(err);
        else users.setList(rows);
    });
});
