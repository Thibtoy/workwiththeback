//On récupère express et notre body parser
const express = require('express');
const bodyParser = require('body-parser');

//On définit nos variables d'environnement
const PORT = process.env.PORT || 8000;
const frontPath = process.env.FRONT_PATH || 'http://localhost:3000';

//On définit express dans notre constante "app"
const app = express();

//On prépare le body parser
const urlencoded = bodyParser.urlencoded({extended:true});

//On l'utilises
app.use(urlencoded);
app.use(bodyParser.json());

//On déclare les access control des headers
app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
	res.setHeader('Access-Control-Allow-Origin', frontPath);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

const userRoute = require('./config/routes/user');
	  userRoute(app);

const fillAppRoute = require('./config/routes/fillApp');
	  fillAppRoute(app);

//à commenter une fois les datas insérées, route de fausses données
// const dataRoute = require('./config/routes/data');
// 	  dataRoute(app);

//Mise en place du port d'écoute
app.listen(PORT, () => console.log('Listening ont '+PORT));