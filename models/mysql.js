//On paramètre les identifiants de connexion
const connection = {
		host: process.env.DATABASE_URL || 'localhost',
		user: process.env.DATABASE_USER || 'root',
		password: process.env.DATABASE_PASS || 'root',
		database: process.env.DATABASE_NAME || 'WorkWithTheBest',
}

// connection.connect(function(err){
// 	if (err) throw err;
// 	console.log('db connected')
// })

//On exportes 'connection'
module.exports = connection;

// var connection;

// function handleDisconnect() {
//   connection = mysql.createConnection(db_config); // Recreate the connection, since
//                                                   // the old one cannot be reused.

//   connection.connect(function(err) {              // The server is either down
//     if(err) {                                     // or restarting (takes a while sometimes).
//       console.log('error when connecting to db:', err);
//       setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
//     }                                     // to avoid a hot loop, and to allow our node script to
//   });                                     // process asynchronous requests in the meantime.
//                                           // If you're also serving http, display a 503 error.
//   connection.on('error', function(err) {
//     console.log('db error', err);
//     if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//       handleDisconnect();                         // lost due to either server restart, or a
//     } else {                                      // connnection idle timeout (the wait_timeout
//       throw err;                                  // server variable configures this)
//     }
//   });
// }

// handleDisconnect();