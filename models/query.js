const db = require('./mysql.js');

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

function innerJoin(innerJ) {
	let query = '';
	for (let prop in innerJ) {
		query += ' INNER JOIN '+innerJ[prop].table+' ON '+innerJ[prop].on;
	}
	return query;
}

function where(where) {
	let query = ' WHERE ';
		let count = 0;
		for (let param in where){
			if (param === 'like') {
				for (let field in where[param]){
					where[param][field].forEach(function(item, i){
						query += (i === 0)? field+" LIKE '"+mysqlEscape(item.toString())+
						"%'" : " '%"+mysqlEscape(item.toString())+"%'";
					})
				}
			}
			else {
				query += (count === 0)? param+" = '"+mysqlEscape(where[param].toString())+
				"'" : ' OR '+param+" = '"+mysqlEscape(where[param].toString())+"'";
				count++
			}
		}
		return query;
}

exports.find = function(options, results) {
	let query = 'SELECT '
	if (options.distinct) query += 'DISTINCT ';
	query += options.fields+' FROM '+options.table;
	if (options.innerJoin) query += innerJoin(options.innerJoin);
	if (options.where) query += where(options.where);
	if (options.orderBy) query += ' ORDER BY '+options.orderBy.field+' '+options.orderBy.order;
	if (options.limit) query += ' LIMIT '+options.limit;
	console.log(query);
	return db.query(query, function(err, data){
		if (err) return results(err, null);
		else if(data.length === 0) return results(null, false);
		else if(data.length === 1) return results(null, data[0]);
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
	console.log(query);
	return db.query(query, params, function(err, data){
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
		console.log(query);
		return db.query(query, params, function(err, data){
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
		console.log(query, values);
		return db.query(query, values, function(error, result){
			if (error) reject(error);
			resolve('success');			
		})		
	})
}