const mysql = require('mysql');

const connection = mysql.createConnection({
	host: 'us-cdbr-iron-east-02.cleardb.net',
	user: 'b3019958943076',
	password: '0d3022ea',
	database: 'heroku_4828e0c88395693'
});

connection.connect(function(err){
	if (err) throw err;
	console.log('db connected')
})

module.exports = connection;