var mysql = require('mysql2');
var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'one',
    password: 'one',
    database: 'onemoreset',
    port: '3306'
 });

db.connect();

module.exports = db;
