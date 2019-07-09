const query = require('../models/query');
const axios = require('axios');
const convert = require('xml-js');
const pH = require('password-hash');

exports.dataDistricts = function(req, res) {
	axios.get('https://geo.api.gouv.fr/departements').then(response => {
		let data = [];
		let promises = [];

		response.data.forEach(function(item){
			let dpt = {name: item.nom, code: item.code};
			data.push(dpt);
		});

		data.forEach(function(item, i){
			promises.push(	
				new Promise(function(resolve, reject) {query.test({table: 'districts', fields: item})
					.then((success) => {resolve(success)})
					.catch(err => {reject(err);})
				})
			);
		});

		Promise.all(promises)
		.then(success => {
			res.status(201).send('all good');
		}).catch(err => {
			console.log(err);
			res.status(200).send('an error occurs, tcheck your terminal to find out what appends')
		});
	});
}

exports.dataLocations = function(req, res) {
	let params = {fields: 'code, id', table: 'districts'}
	query.find(params, function(err, datas) {
		if(err) console.log(err);
		else {
			let promises = [];
			datas.forEach(function(data){
				promises.push(
					new Promise(function(resolve, reject){
						axios.get('https://geo.api.gouv.fr/departements/'+data.code+'/communes').then(response => {
							response.data.forEach(function(item){
								let location = {
									name: item.nom,
									code: item.codesPostaux,
									districtId: data.id
								}
								query.test({table: 'locations', fields: location})
									.then(success => {resolve(success)})
									.catch(err => {reject(err)});
							}); 
						});
					})
				);
			});
			Promise.all(promises)
				.then(success => {
					res.status(201).send('all good');
				})
				.catch(err => {
					console.log(err);
					res.status(200).send('an error occurs, tcheck your terminal to find out what appends');
				})
		}
	});
}

exports.dataActivity = function(req, res) {
	let fs = require('fs');
	let xml = fs.readdirSync('./data/fichesMetiers');
	let promises = [];
	xml.forEach(function(item) {
		promises.push(
			new Promise(function(resolve, reject){
				let toTreat = fs.readFileSync('./data/fichesMetiers/'+item, 'utf-8');
				let result = convert.xml2json(toTreat, {compact:true, space:4});
				let data = JSON.parse(result);
				let activityTitle = {name: data['fiche_emploi_metier']['bloc_code_rome']['intitule']['_text']};
				query.test({table: 'activityTitle', fields: activityTitle})
					.then(success => {
						let promises2 = [];
						for (item in data['fiche_emploi_metier']['bloc_appellation']['item_app']) {
							promises2.push(
								new Promise(function(resolve, reject) {
									if (!data['fiche_emploi_metier']['bloc_appellation']['item_app'][item]['libelle']) {
										if (item === 'libelle') {
											let activity = {name: data['fiche_emploi_metier']['bloc_appellation']['item_app'][item], activityTitleId: success};
		 									query.test({table: 'activity', fields: activity})
		 										.then(success => {resolve(true)})
		 										.catch(err => {reject(err)});
										}
										else resolve(true);
									}
									else {
										let activity = {name: data['fiche_emploi_metier']['bloc_appellation']['item_app'][item]['libelle']['_text'], activityTitleId: success};
		 								query.test({table: 'activity', fields: activity})
		 									.then(success => {resolve(true)})
		 									.catch(err => {reject(err)});
		 							}
		 						})
		 					);
		 				}
		 				Promise.all(promises2)
		 					.then(success => {resolve(success)})
		 					.catch(err => {reject(err)});
		 			})
					.catch(err => {reject(err)})
			})
		);
	});
	Promise.all(promises)
		.then(results => {res.status(200).json('all good')})
		.catch(err => {
			console.log(err);
			res.status(200).send('error');
		});
}


exports.dataUsers = function(req, res) {
	let promises =[];
	let profiles = [
		{user: {firstName: 'Jean', lastName: 'Jeannot', email: 'jeanjeannot@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 4951}, location: {name: 'Strasbourg'}
		},
		{user: {firstName: 'Jeanne', lastName: 'Jeanine-Jackson', email: 'jeannejeaninejeanjackson@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 9593}, location: {name: 'Paris'}
		},
		{user: {firstName: 'Marc', lastName: 'Marcus', email: 'marcmarcus@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 3781}, location: {name: 'Grenoble'}
		},
		{user: {firstName: 'Julio', lastName: 'Juliogàs', email: 'juliogàs@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 1410}, location: {name: 'Perpignan'}
		},
		{user: {firstName: 'Faustine', lastName: 'Foster', email: 'fausfoster@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 2658}, location: {name: 'Reims'}
		},
		{user: {firstName: 'Marco', lastName: 'Paulo', email: 'marcopaulo@saipasuneblague.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 9387}, location: {name: 'Avignon'}
		},
		{user: {firstName: 'Jean', lastName: 'Jeannot', email: 'jeanjeannot@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 512}, location: {name: 'Verderel-lès-Sauqueuse'}
		},
		{user: {firstName: 'Paula', lastName: 'Paulette', email: 'paupau@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 7079}, location: {name: 'Clergoux'}
		},
		{user: {firstName: 'Colin', lastName: 'Maillard', email: 'colinmaillard@saipasuneblague.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 3514}, location: {name: 'Saint-Nom-la-Bretèche'}
		},
		{user: {firstName: 'Christinne', lastName: 'Kirstensen', email: 'krikri@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 activity: {id: 9176}, location: {name: 'Marly-Gomont'}
		},	
	];

	profiles.forEach(function(profile){
		promises.push(new Promise(function(resolve, reject){
			query.test({table: 'users', fields: profile.user})
				.then(success => {
					let location = profile.location.name;
					let params = {fields: 'id, name', table: 'locations', where:{name: location}}
					query.find(params, function(err, data){
						params = {userId: success, locationId: data.id};
						query.test({table: 'userToLocation', fields: params})
							 .then(resuccess => {
							 	params = {userId: success, activityId: profile.activity.id}
							 	query.test({table: 'userToActivity', fields: params})
							 		 .then(success => {
							 		 	resolve(success);							 		 
							 		 })
							 		 .catch(err => {
							 		 	console.log(err);
							 		 	reject(err);
							 		 })
							 })
							 .catch(err => {
								console.log(err);
								reject(err);
							 });	
					});
				})
				.catch(err => {
					console.log(err);
					reject(err);
				});
		}));
	});
	Promise.all(promises).then(success => res.status(200).json('yes'))
						 .catch(err => res.status(200).json('something went wrong'));
}

exports.dataCompanies = function(req, res) {
	let promises =[];
	let profiles = [
		{user: {name: 'Les cerceuils chantants', siret: '000000000', description: 'Fabricants de cerceuils', email: 'lescerceuilschantant@jaimail.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Aigues-Mortes'}
		},
		{user: {name: 'Lave\'auto', siret: '000000001', description: 'Laveur d\'auto/moto', email: 'lelaveauto@jaimail.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Ablaincourt-Pressoir'}
		},
		{user: {name: 'La charcuterie Corse', siret: '000000002', description: 'Vente de sandwichs à base de charcuterie', email: 'marcmarcus@jaimail.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Bordeaux'}
		},
		{user: {name: 'Mamy\'s SPA', siret: '000000003', description: 'Spa pour personnes agées', email: 'mamyspa@jaimail.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Gigors-et-Lozeron'}
		},
		{user: {name: 'Centre Géologique', siret: '000000004', description: 'Recherches géologiques', email: 'géo@jaimail.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Volvic'}
		},
		{user: {name: 'La compagnie Gengis Khan', siret: '000000005', description: 'Troupe de théatre', email: 'gengiskhan@saipasuneblague.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Gigors-et-Lozeron'}
		},
		{user: {name: 'La ferme du moulin', siret: '000000006', description: 'Corps agricole', email: 'lafermedumoulin@jaimail.com', password: pH.generate('coucou'), activated: 1},
		 location: {name: 'Limoux'}
		},
		{user: {name: 'Nucleaire&Cie', siret: '000000007', description: 'Groupe de recherche et promotion du nucleaire', email: 'tchernobyl@jaimail.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Senuc'}
		},
		{user: {name: 'ClubMeud', siret: '000000008', description: 'Entreprise proposant des voyages à thèmes dans des camps de vaccances', email: 'clubmeud@saipasuneblague.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Vaulx-en-Velin'}
		},
		{user: {name: 'Les studios Buc Lessons', siret: '000000009', description: 'Studios de production de sitcom', email: 'buclessonstudio@jaimail.com', password: pH.generate('coucou'), activated: 1},
		  location: {name: 'Vallorcine'}
		},	
	];

	profiles.forEach(function(profile){
		promises.push(new Promise(function(resolve, reject){
			query.test({table: 'companies', fields: profile.user})
				.then(success => {
					let location = profile.location.name;
					let params = {fields: 'id, name', table: 'locations', where:{name: location}}
					query.find(params, function(err, data){
						params = {companyId: success, locationId: data.id};
						query.test({table: 'companyToLocation', fields: params})
							 .then(success => {
							 	resolve(success);
							 })
							 .catch(err => {
								console.log(err);
								reject(err);
							 });	
					});
				})
				.catch(err => {
					console.log(err);
					reject(err);
				});
		}));
	});
	Promise.all(promises).then(success => res.status(200).json('yes'))
						 .catch(err => res.status(200).json('something went wrong'));
}

exports.dataCompaniesOffers = function(req, res) {
	let promises = [];
	let offers = [
		{content: {title: 'Menuisier(sière), Fabrication de cerceuils', content: 'recherchons Menuisier/Menuisière '+
		 'pour un poste dans notre fabrique de cerceuils', startDate: -3600000, endDate: 604800000, ownerId: 1},
	     location: 29289},
		{content: {title: 'Vendeur(euse) de sandwichs', content: 'recherchons vendeur/vendeuse '+
		 'pour un poste dans notre petite cahutte en bord de mer, vous vendrez des sandwichs à base '+
		 'de charcutterie corse', startDate: 86400000, endDate: (2592000000+86400000), ownerId: 3},
		 location: 24776},
		{content: {title: 'Animateur(trice) en aqua gymnastique', content: 'recherchons animateur(trice) '+
		 "pour un poste dans notre superbe spa, le Mamy's SPA", startDate: 2592000000, endDate: 2592000000*2, ownerId: 4},
		 location: 25384},
		 {content: {title: 'Lorem Ipsum', content: 'recherchons Ipsum Lorem '+
		 "pour IpsumLoremopsum", startDate: 2592000000, endDate: 2592000000*2, ownerId: 6},
		 location: 23384},
		 {content: {title: 'IpsumLoremi', content: 'recherchons Loriem Ipsaume '+
		 'pour un Lorem Ipsom dans notre ipsumLoRemo', startDate: 2592000000, endDate: 2592000000*2, ownerId: 8},
		 location: 15384}
	];

	offers.forEach(function(offer){
		promises.push(
			new Promise(function(resolve, reject){
				let startDate = new Date(Date.now()+offer.content.startDate),
					endDate = new Date(Date.now()+offer.content.endDate);
				offer.content.startDate = startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-"+startDate.getDate()+" "+startDate.getHours()+":"+startDate.getMinutes()+":"+startDate.getSeconds();
				offer.content.endDate = endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDate()+" "+endDate.getHours()+":"+endDate.getMinutes()+":"+endDate.getSeconds();
				query.test({table: "companiesOffers", fields: offer.content})
		 			 .then(success => {
		 				query.test({table: 'companiesOffersToLocation', fields: {offerId: success, locationId: offer.location}})
		 					.then(success => resolve(success))
		 					.catch(err => reject(err));
		 			})
		 			 .catch(err => {
		 				console.log(err);
		 				reject(err);
		 			});
			})
		);
	});

	Promise.all(promises).then(success => res.status(200).json('cégood'))	
						 .catch(err => res.status(200).json('something went wrong'));
}

exports.dataUsersOffers = function(req, res) {
	let promises = [];
	let offers = [
		{content: {title: 'Menuisier', content: 'cherches poste '+
		 'dans fabrique de cerceuils', startDate: -3600000, endDate: 604800000, ownerId: 1},
	     location: 24289},
		{content: {title: 'Vendeur de sandwichs', content: 'cherche poste'+
		 'dans petite cahutte en bord de mer', startDate: 86400000, endDate: (2592000000+86400000), ownerId: 3},
		 location: 24},
		{content: {title: 'Animateur en aqua panning', content: 'Animateur en aqua'+
		 "planning (horaires de piscine de compet etc...", startDate: 2592000000, endDate: 2592000000*2, ownerId: 4},
		 location: 2584},
		 {content: {title: 'Lorem Ipsum', content: 'Ipsum Lorem '+
		 "pour IpsumLoremopsum", startDate: 2592000000, endDate: 2592000000*2, ownerId: 6},
		 location: 2384},
		 {content: {title: 'IpsumLoremi', content: 'Loriem Ipsaume '+
		 'pour un Lorem Ipsom dans votre ipsumLoRemo', startDate: 2592000000, endDate: 2592000000*2, ownerId: 8},
		 location: 1284}
	];

	offers.forEach(function(offer){
		promises.push(
			new Promise(function(resolve, reject){
				let startDate = new Date(Date.now()+offer.content.startDate),
					endDate = new Date(Date.now()+offer.content.endDate);
				offer.content.startDate = startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-"+startDate.getDate()+" "+startDate.getHours()+":"+startDate.getMinutes()+":"+startDate.getSeconds();
				offer.content.endDate = endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDate()+" "+endDate.getHours()+":"+endDate.getMinutes()+":"+endDate.getSeconds();
				query.test({table: "usersOffers", fields: offer.content})
		 			 .then(success => {
		 				query.test({table: 'usersOffersToLocation', fields: {offerId: success, locationId: offer.location}})
		 					.then(success => resolve(success))
		 					.catch(err => reject(err));
		 			})
		 			 .catch(err => {
		 				console.log(err);
		 				reject(err);
		 			});
			})
		);
	});

	Promise.all(promises).then(success => res.status(200).json('cégood'))	
						 .catch(err => res.status(200).json('something went wrong'));
}

//1 year: 31 622 400 ms
//1 month: 2 592 000ms
//1 day: 86 400 ms
//1 week: 604 800 ms
//1 hour: 3 600 ms