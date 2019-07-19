const query = require('../models/query');

exports.carrousel = function(req, res) {
	let name = (req.body.type === 'users')? req.body.type+'.firstName, '+req.body.type+'.lastName':req.body.type+'.name';
	let params = {
		distinct: true,
		fields: req.body.type+'Offers.ownerId, '+req.body.type+
		'Offers.id, title, content, '+name+', locations.name AS location, startDate, endDate', 
		table: req.body.type+'Offers', 
		innerJoin: {
			first:{table: req.body.type, on: req.body.type+'.id = '+req.body.type+'Offers.ownerId'},
			second:{table: req.body.type+'OffersToLocation AS ToLoc', on: req.body.type+
			'Offers.id = ToLoc.offerId'},
			third:{table: 'locations', on: 'ToLoc.locationId = locations.id'}
		},
		where:{active: 1},
		orderBy: {field: req.body.type+'Offers.Id', order: 'DESC'},
		limit: 5,
	};
	query.find(params, function(err, data){
		if(err) {
			res.status(200).json(err);
		}
		else {
			res.status(200).json(data);
		}
	})
}

exports.dashboard = function(req, res) {
	let promises = [];
	let params = {};
	req.body.type.forEach(function(table) {
		params = {
			table: table+'Offers',
			fields: '*',
		}
		promises.push(
			new Promise (function(resolve, reject){
				query.find(params, function(err, data){
					if(err) reject(err);
					else {
						let promises2 = [];
						data.forEach(function(item){
							promises2.push(
								new Promise (function(resolve, reject){
									let params = {
										table: table+'OffersToLocation AS link',
										fields: 'link.id AS linkId, locations.name as location, locations.code, locations.id AS locationId',
										innerJoin: {
											first: {table: 'locations', on: 'link.locationId = locations.id'},
										},
										where: {'link.id': item.id},
										limit: 1,
									}
									query.find(params, function(err, data){
										if(err) reject(err);
										else {
											item.locations = data;
											let params = {
												table: table+'OffersToActivity AS link',
												fields: 'link.id AS linkId, activity.name as activity, activity.id AS activityId',
												innerJoin: {
													first: {table: 'activity', on: 'link.activityId = activity.id'},
												},
												where: {'link.id': item.id},
												limit: 1,
											}
											query.find(params, function(err, data){
												if(err) reject(err);
												else {
													item.activity = data;
													resolve(item);
												}
											})
										}
									})
								})
							);
						})
						Promise.all(promises2)
							.then(data => resolve(data))
							.catch(err => reject(err));
					};
				});
			})
		);
	});	
	Promise.all(promises)
		.then(data => res.status(200).json(data))
		.catch(err => res.status(200).json(err));
}

exports.wordResearch = function(req, res) {
	let fields = (req.body.table === 'locations')? 'id, name, code' : 'id, name';
	let params = {
		fields: fields,
		table: req.body.table,
		where: {
			like: {
				name: req.body.word.split(' '),
			},
		},
		limit: 5,
	}
	query.find(params, function(err, data){
		if(err) {
			res.status(400).json(err);
		}
		else {
			res.status(200).json(data);
		}
	})
}

exports.addOffer= function(req, res) {
	let params = {
		table: req.body.role+'Offers',
		fields: {
			title: req.body.title,
			content: req.body.content,
			startDate: req.body.startDate,
			endDate: req.body.endDate,
			ownerId: req.body.ownerId,
		}
	}
	query.test(params)
		 .then(data => {
		 	let promises = [];
		 	for (let prop in req.body.locationsList) {
		 			let params = {
		 				table: req.body.role+'OffersToLocation',
		 				fields: {
		 					offerId: data,
		 					locationId: prop,
		 				}
		 			}
		 			let promise = new Promise(function(resolve, reject){
		 				query.test(params)
		 					 .then(data => {resolve(true)})
		 					 .catch(err => {reject(err)})
		 			})
		 			promises.push(promise);
		 	}
		 	for (let prop in req.body.activityList) {
		 			let params = {
		 				table: req.body.role+'OffersToActivity',
		 				fields: {
		 					offerId: data,
		 					activityId: prop,
		 				}
		 			}
		 			let promise = new Promise(function(resolve, reject){
		 				query.test(params)
		 					 .then(data => {resolve(true)})
		 					 .catch(err => {reject(err)})
		 			});
		 			promises.push(promise);
		 	}
		 	Promise.all(promises)
		 		.then(data => {
		 			res.status(201).json('created');
		 		})
		 		.catch(err => {
		 			res.status(400).json(err);
		 		});
		 })
		 .catch(err => {
		 	res.status(400).json(err);
		 });
}

exports.offers = function(req, res) {
	let offer = req.body;
	let params = {
		table: offer.type+'Offers',
		fields: 'id, title, startDate, endDate, active',
		where: {ownerId: offer.ownerId},
		orderBy: {field: offer.type+'Offers.Id', order: 'DESC'},
		limit: 5,
	}
	query.find(params, function(err, data){
		if (err) res.status(400).json(err);
		else res.status(200).json(data);
	});
}

exports.getOffer = function(req, res) {
	let offer = req.body;	
	let promise1 = new Promise(function(resolve, reject){
		let params = {
			table: offer.type+'Offers',
			fields: 'title, content, startDate, endDate, ownerId',
			where: {[offer.type+'Offers.id']: offer.id},
		}
		query.find(params, function(err, data){
			if (err) reject(err);
			else {
				resolve(data);
			}
		});
	});			
	let promise2 = new Promise(function(resolve, reject){
		let params = {
			table: offer.type+'OffersToLocation AS link',
			fields: 'link.id AS linkId, locations.name, locations.code, locations.id AS locationId',
			innerJoin: {
				first: {table: 'locations', on: 'link.locationId = locations.id'},
			},
			where: {['link.offerId']: offer.id},
		}
		query.find(params, function(err, data){
			if (err) reject(err);
			else resolve(data);
		});
	});
	let promise3 = new Promise(function(resolve, reject){
		let params = {
			table: offer.type+'OffersToActivity AS link',
			fields: 'link.id AS linkId, activity.name, activity.id AS activityId',
			innerJoin: {
				first: {table: 'activity', on: 'link.activityId = activity.id'},
			},
			where: {['link.offerId']: offer.id},
		}
		query.find(params, function(err, data){
			if (err) reject(err);
			else resolve(data);
		});
	});
	Promise.all([promise1, promise2, promise3])
				 .then(data => res.status(200).json(data))
				 .catch(err => {
				 	res.status(400).json(err)
				 });
}

exports.updateOffer = function(req, res) {
	let conditions = {};
	let promises = []; 
	let params = {
		table: req.body.role+'Offers', 
		fields: {},
		where: {id: req.body.id},
	}
	for (let field in req.body.updated) {
		params.fields[field] = req.body[field]; 
		conditions.update = true;
	}
	if (conditions.update) {
		promises.push(
			new Promise (function(resolve, reject){
				query.update(params)
		 			.then(data => resolve(data))
		 			.catch(err => reject(err));
			})
		);	
	}

	for (let field in req.body.remove) {
		promises.push(
			new Promise (function(resolve, reject){
				let record = {
					table: req.body.role+'OffersTo'+req.body.remove[field], 
					id: field
				}
				query.delete(record)
					.then(data => resolve(data))
					.catch(err => reject(err));
			})
		)
	}
	for (let prop in req.body.locationsList) {
		let params = {
		 	table: req.body.role+'OffersToLocation',
		 	fields: {
		 		offerId: req.body.id,
		 		locationId: prop,
		 	},
		}
		promises.push(
			new Promise(function(resolve, reject){
		 		query.test(params)
		 			.then(data => {resolve(true)})
		 			.catch(err => {reject(err)});
		 	})
		);
	}
	for (let prop in req.body.activityList) {
		let params = {
		 	table: req.body.role+'OffersToActivity',
		 	fields: {
		 		offerId: req.body.id,
		 		activityId: prop,
		 	},
		}
		promises.push(
			new Promise(function(resolve, reject){
		 		query.test(params)
		 			.then(data => {resolve(true)})
		 			.catch(err => {reject(err)});
		 	})
		 );
	}
	if (promises.length > 0){
		Promise.all(promises)
			.then(data => res.status(200).json(data))
			.catch(err => res.status(400).json(err)); 
	}
	else res.status(400).json('nothing to update');
}

exports.deleteOffer = function(req, res) {
	console.log(req);
	let record = {
		table: req.body.type+'Offers',
		id: req.body.id,
	}
	query.delete(record)
		.then(data => res.status(200).json(data))
		.catch(err => {
			console.log(err);
			res.status(400).json(err)
		});
}