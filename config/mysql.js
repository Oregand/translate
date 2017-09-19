var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'vsinterview.ckdxitur80we.eu-west-1.rds.amazonaws.com',
  user            : 'vswareuser123',
  password        : 'vswarepassword123',
  database		  : 'audit',
  port:          3306
});

module.exports = pool;
