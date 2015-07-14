$(function () {

    var config = fse.readJsonSync(configFile);

    $('#txtHost').val(config.db.host);
    $('#txtPort').val(config.db.port);
    $('#txtDatabase').val(config.db.database);
    $('#txtUsername').val(config.db.user);
    $('#txtPassword').val(config.db.password);

    $('#btnSaveSetting').on('click', function (e) {
        e.preventDefault();

        var db = {};
        db.host = $('#txtHost').val();
        db.port = $('#txtPort').val() || 3306;
        db.database = $('#txtDatabase').val();
        db.user = $('#txtUsername').val();
        db.password = $('#txtPassword').val();

        if (!db.host || !db.database || !db.user || !db.password ) {
            $('#alertError').fadeIn();
            $('#alertSuccess').fadeOut();
        } else {
            fse.writeJsonSync(configFile, {db: db});
            $('#alertSuccess').fadeIn();
            $('#alertError').fadeOut();
        }

    });
});
