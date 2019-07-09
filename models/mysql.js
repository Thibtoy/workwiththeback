const mysql = require('mysql');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'WorkWithTheBest'
});

connection.connect(function(err){
	if (err) throw err;
	console.log('db connected')
})

module.exports = connection;