
var mysql = require('mysql');
var mysql_options = require('../options').database;
var pool = mysql.createPool(mysql_options);

var db = {
    query: function (sql, params, callback) {
        pool.query(sql, params, callback);
    }
};

module.exports = db;
