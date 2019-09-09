const dbConfig = require('./mysql.js');
const mysql = require('mysql');

function mysqlEscape(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}

function join(toJoin, type='INNER') {
	let query = '';
	for (let prop in toJoin) {
		query += ' '+type+' JOIN '+toJoin[prop].table+' ON '+toJoin[prop].on;
	}
	return query;
}

function where(where) {
	let query = ' WHERE ';
	let started = false;
	let between = false;
		for (let param in where){
			if (param === 'like') {
				for (let field in where[param]){
					(started)? query+= ' AND ': started = true;
					where[param][field].forEach(function(item, i){
						query += (i === 0)? "("+field+" LIKE '"+mysqlEscape(item.toString())+
						"%'" : " '%"+mysqlEscape(item.toString())+"%'";
					})
				}
				query+= ")";
			}
			else if (param === 'and') {
				let count = 0;
				(started)? query+= ' AND ': started = true;
				for (let field in where[param]){
					query += (count === 0)? "("+field+" = '"+mysqlEscape(where[param][field].toString())+
					"' " : ' AND '+field+" = '"+mysqlEscape(where[param][field].toString())+"'";
					count++
				}
				query+= ")";
			}
			else if ((param === 'endDate' || param === 'startDate') && where[param].length > 0) {
				let operator = (param === 'startDate')? '>=' : '<=';
				query += (started)? " AND ("+param+" "+operator+" '"+mysqlEscape(where[param].toString())+
				"' " : '('+param+" "+operator+" '"+mysqlEscape(where[param].toString())+"'";
				query+= ")";
				started = true;
				between = true;

			}
			else if (typeof where[param] !== 'string' && where[param].length) {
				(started)? query+= ' AND ': started = true;
				where[param].forEach(function(item, i) {
					query += (i === 0)? "("+param+" = '"+mysqlEscape(item.toString())+"' " : ' OR '+param+
					" = '"+mysqlEscape(item.toString())+"'";
				})
				query+= ")";
			}
			else if(typeof where[param] === 'string' || typeof where[param] === 'number'){
				query += (started)? " AND ("+param+" = '"+mysqlEscape(where[param].toString())+
				"' " : '('+param+" = '"+mysqlEscape(where[param].toString())+"'";
				query+= ")";
				started = true;
			}
		}
		return query;
}

function fieldConcat(fields) {
	let query = '';
	for (let field in fields) {
		query += ", GROUP_CONCAT(DISTINCT "+field+"."+fields[field]+") AS "+field+fields[field];
	}
	return query;
}


//SELECT GROUP_CONCAT(DISTINCT locations.name) AS location, startDate, endDate FROM usersOffers INNER JOIN users ON users.id = usersOffers.ownerId INNER JOIN usersOffersToLocation AS ToLoc ON usersOffers.id = ToLoc.offerId INNER JOIN locations ON ToLoc.locationId = locations.id WHERE active = '1' GROUP BY usersOffers.id

exports.find = function(options, results) {
	let query = 'SELECT '
	query += options.fields;
	if (options.fieldConcat) query += fieldConcat(options.fieldConcat);
	query += ' FROM '+options.table;
	if (options.leftJoin) query += join(options.leftJoin, 'LEFT');
	if (options.innerJoin) query += join(options.innerJoin);
	if (options.where) query += where(options.where);
	if (options.groupBy) query += ' GROUP BY '+options.groupBy.field;
	if (options.orderBy) query += ' ORDER BY '+options.orderBy.field+' '+options.orderBy.order;
	if (options.limit) query += ' LIMIT '+options.limit;
	let connection = mysql.createConnection(dbConfig);
	connection.connect(function(err){
		if (err) throw err;
	});
	console.log(query);
	return connection.query(query, function(err, data){
		connection.end();
		if (err) {
			console.log(err);
			return results(err, null);}
		else if(data.length === 0) return results(null, false);
		else if (data.length === 1) return results(null, [data[0]]);
		else {
			let total = [];
			data.forEach(function(item){
				let result = {};
				for (let prop in item){
					result[prop] = item[prop];
				}
				total.push(result);
			});
		 	return results(null, total);
		}
	});
}

exports.create = function(options, result) {
	let params = {};
	for (let field in options.fields) {
		params[field] = mysqlEscape(options.fields[field].toString());
	}
	let query = 'INSERT INTO '+options.table+' SET ? ';
	let connection = mysql.createConnection(dbConfig);
	connection.connect(function(err){
		if (err) throw err;
	})
	return connection.query(query, params, function(err, data){
		connection.end()
		if (err) return result(err, null);
		else return result(false, data);
	})
}

exports.test = function(options) {
	return new Promise(function(resolve, reject) {
		let params = {};
		for (let field in options.fields) {
			params[field] = mysqlEscape(options.fields[field].toString());
		}
		let query = 'INSERT INTO '+options.table+' SET ? ';
		let connection = mysql.createConnection(dbConfig);
		connection.connect(function(err){
			if (err) throw err;
		})
		return connection.query(query, params, function(err, data){
			connection.end()
			if (err) return reject(err);
			else return resolve(data.insertId);
		})
	})
}

exports.update = function(options) {
	return new Promise(function(resolve, reject) {
		let query = 'UPDATE '+options.table+' SET';
		let length = Object.keys(options.fields).length;
		let count = 0;
		let values = [];
		for (let field in options.fields) {
			count++			
			values.push(mysqlEscape(options.fields[field].toString()));
			query += (count === length)? ' '+field+'= ?':' '+field+'= ?,';
		}
		let where = ' WHERE '
		count = 0;
		for (let prop in options.where){
			where += (count === 0)? prop+' = ?': ' OR '+prop+' = ?';
			values.push(mysqlEscape(options.where[prop].toString()))
			count++
		}
		query += where; 
		let connection = mysql.createConnection(dbConfig);
		connection.connect(function(err){
			if (err) throw err;
		})
		console.log( query, values);
		return connection.query(query, values, function(error, result){
			if (error) reject(error);
			resolve('success');			
		})		
	})
}

exports.delete = function(options) {
	return new Promise(function(resolve, reject) {
		let query = 'DELETE FROM '+mysqlEscape(options.table)+' WHERE id='+mysqlEscape(options.id);
		let connection = mysql.createConnection(dbConfig);
		connection.connect(function(err){
			if (err) throw err;
		})
		console.log(query);
		return connection.query(query, function(err, success){
			connection.end();
			if (err) reject(err);
			else resolve(success)
		})
	})
}