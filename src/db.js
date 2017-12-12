const mysql = require('mysql');

let connection;

let connect = function () {
	connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : process.env.MYSQL_PASSWORD,
		database : 'PriCoSha'
	});
	return connection.connect();
};

let query = function (query) {
	return new Promise(function (resolve, reject) {
		connection.query(query, function (error, results, fields) {
			if (error) {
				reject(error);
			}
			resolve(results)
		});
	});
};

let disconnect = function () {
	return connection.end();
};

module.exports = { connect, query, disconnect };