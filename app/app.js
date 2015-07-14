
var path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    moment = require('moment'),
    _ = require('lodash'),

    gui = require('nw.gui'),
    win = gui.Window.get();

var defaultConfig = {
    db: {
        host: '127.0.0.1',
        port: 3306,
        database: 'hos',
        user: 'root',
        password: '123456'
    }
};

var configFile = path.join(gui.App.dataPath, 'config.json');
// Check configure file exist
if (fs.access(configFile, fs.R_OK && fs.W_OK, function (err) {
    if (err) {
        // Create configure file
        fse.writeJsonSync(configFile, defaultConfig);
    }
}));

// Get Connection
var getConnection = function () {

        var config = fse.readJsonSync(configFile);
        var db = require('knex')({
            client: 'mysql',
            connection: config.db,
            debug: false
        });

    return db;
}
