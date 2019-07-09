//const Users = require('../models/userModel');
//const {User} = require('../models/sequelize');
const pH = require('password-hash');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const query = require('../models/query.js');
const nodeMailer = require('nodemailer');


exports.signUp = function(req, res) {
			req.body.password = pH.generate(req.body.password);
			let type = req.body.type;
			delete req.body.type;
			let params = {fields: 'id', table: type, where:{email: req.body.email}};
			query.find(params, function(err, user){
				if (err) res.status(400).json(err);
				else if(!user) {
					let params = {table: type, fields: req.body};
 					query.create(params, function(err, data){
 						if (err) res.status(400).json(err);
 						else {
 							let token = jwt.sign({id: data.insertId, table: type}, config.SECRET);
 							sendValidationMail(req.body.email, token);
 							res.status(201).json({created: true, message:data});
 						}
 					});
 				}
 				else res.status(200).json({created: false, message: "This Account already exists"});
			});
			
		

}

exports.login = function(req, res) {
		let params = {fields: '*', table: req.body.type, where:{email: req.body.email}};
		query.find(params, function(err, user){
			console.log(user);
			if (err) res.status(400).json(err);
			else if (!user || user.activated === 0) res.status(200).json({message: 'This user does not exists'});
			else if (pH.verify(req.body.password, user.password)) {
				let name = (user.firstName)?user.firstName+' '+user.lastName: user.name;
				let token = jwt.sign({logged: true, id:user.id, name: name, role: req.body.type}, config.SECRET);
				res.status(200).json({authenticate: true, token: token, message: 'Successfully connected'});
			}
			else res.status(200).json({authenticate: false, message: 'Incorrect password'});
		});
}

exports.activateAccount = function(req, res) {
	let token = req.query.token;
	jwt.verify(token, config.SECRET, function(err, decoded){
		if (err) res.status(400).json('Authentication Faillure, maybe the link that you followed is expired :3');
		else {
			query.update({table: decoded.table, fields: {activated: 1}, where:{id: decoded.id}})
				.then(() => {
					res.redirect('http://localhost:3000/');
			})
				.catch((err) => {
					console.log(err);
					res.status(400).json('Activation faillure, something went wrong');
				})
		}
	})

}

exports.authenticated = function(req, res) {
	jwt.verify(req.body.token, config.SECRET, function(err, decoded){
		if (err) res.status(400).json(err);
		else {
			res.status(200).json({auth: true, user: decoded});
		};
	});
}

function sendValidationMail(mail, token) {
	let transporter = nodeMailer.createTransport({
			service: 'gmail',
			auth: {
				user: config.MAIL,
				pass: config.GMAILKEY
			}
		})
	let mailConfig = {
		from: '<noreply>',
        to: mail,
        subject: 'Account validation WorkWithTheBest',
        html: '<!DOCTYPE html>'+
			  '		<html lang="en">'+
  			  '			<head>'+
    		  '				<meta charset="utf-8" />'+
    		  '			</head>'+
    		  '			<body>'+
    		  '				<div><p>Congratulations, your registration on WorkWithTheBest is almost done.<br />'+
    		  '				Click on the link below to validate your account!</p><br />'+
    		  '				<a href="http://localhost:8000/activateAccount?token='+token+'">Click Here</a>'+
        	  '			</body>'+
        	  '		</html>'
	}
	transporter.sendMail(mailConfig, function(error, info){
     	if(error){
        	return console.log(error);
     	}
	});
	transporter.close();
}

//signUp Mongo's Method:

//, function(err, user){
// 				if (err) res.status(400).json(err);
// 				if (!user) {
// 					User.create({email: req.body.email, password: pH.generate(req.body.password)}, function(err, user){
// 						if(err) res.status(400).json(err);
// 						else res.status(201).json({created: true, message:"enregistrement réussi", user:user});
// 					});
// 				}else res.status(200).json({created: false, message:"un compte existe déjà pour cet email"});
// 			});
// 		}else res.status(200).json({created: false, message: "Le deuxième password ne correspond pas"});
// 	}else res.status(200).json({created: false, message: "Vous devez renseignertous les champs pour vous inscrire"});
// }

//login Mongo's Method:

	// 	Users.findOne({email: req.body.email}, function(err, user){
	// 		if (err) res.status(400).json(err);
	// 		else if (user == null) res.status(200).json({authenticate: false, message: 'l\'utilisateur n\existes pas'});
	// 		else if (user.authenticate(req.body.password)) {
	// 			res.status(200).json({authenticate: true, token: user.getToken(), message: 'vous êtes connectés'})
	// 		}else res.status(200).json({authenticate: false, message: 'le password est incorrect'});
	// 	});

//SignUp sequelize's Method:

	// User.findOne({where: {email: req.body.email}}).then(user => {
 // 				if(user === null) {
 // 					User.create({email: req.body.email, password: pH.generate(req.body.password)})
 // 						.then(user => {res.status(201).json({created: true, user: user});}, err => {res.status(400).json(err);});
 // 				}
 // 				else {
 // 					let params = {fields: 'id, email, password', table: 'users', where:{email: req.body.email}};
 // 					query.find(params, function(data){res.status(200).json({created: false, message: "This user already exists coucou", user: data})});
 // 				}
 // 			}, err => {res.status(400).json(err);});

 //Login sequelize's Method:

	// User.findOne({where: {email: req.body.email}}).then(user => {
	// 		if (user === null) res.status(200).json({message: 'This user does not exists'});
	// 		else if (pH.verify(req.body.password, user.password)) {
	// 			let token = jwt.sign({logged: true, id: user.id}, config.SECRET);
	// 			res.status(200).json({authenticate: true, token: token, message: 'Successfully connected'});
	// 		}
	// 		else res.status(200).json({authenticate: false, message: 'Incorrect password'});
	// 	}, err => {res.status(400).json(err);}); 	