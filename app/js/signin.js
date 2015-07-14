$(function () {

    var doLogin = function (username, password, cb) {
        var db = getConnection();

        db('web_user')
            .select()
            .where('user_name', username)
            .where('user_password', password)
            .then(function (rows) {
                cb(null, rows);
            })
            .catch(function (err) {
                cb(err);
            });
    }

    $('#btnSignin').on('click', function (e) {
        e.preventDefault();

        var username = $('#txtUsername').val(),
            password = $('#txtPassword').val();

        var crypto = require('crypto');
        var encryptPass = crypto.createHash('md5').update(password).digest('hex');

        if (!username || !password) {
            alert('กรุณากรกอกข้อมูลให้ครบ');
        } else {

            doLogin(username, encryptPass, function (err, rows) {
                if (err) log(err);
                else {
                    if (rows.length) {
                        window.location.href = './index.html';
                    } else {
                        alert('ชื่อผู้ใช้งานหรือรหัสผ่าน ไม่ถูกต้อง');
                    }
                }
            });

        }
    });

});
