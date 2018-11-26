var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs340_gendrond',
    password        : '####',
    database        : 'cs340_gendrond'
});
module.exports.pool = pool;
