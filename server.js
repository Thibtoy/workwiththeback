//Modules utilisés
const express = require('express');
//const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//mongoose.connect('mongodb://localhost/WWTBDb', {useCreateIndex: true, useNewUrlParser: true});
const PORT = process.env.PORT || 8000;
//On définit express dans notre constante "app"
const app = express();

//On prépare le body parser
const urlencoded = bodyParser.urlencoded({extended:true});

app.use(urlencoded);
app.use(bodyParser.json());

app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
	res.setHeader('Access-Control-Allow-Origin', 'https://work-with-the-best.herokuapp.com');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

const userRoute = require('./config/routes/user');
	  userRoute(app);

//à commenter une fois les datas insérées
// const dataRoute = require('./config/routes/data');
// 	  dataRoute(app);

const fillAppRoute = require('./config/routes/fillApp');
	  fillAppRoute(app);
//Mise en place du port d'écoute

app.listen(PORT, () => console.log('Listening ont '+PORT));