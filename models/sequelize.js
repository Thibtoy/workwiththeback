const Sequelize = require('sequelize');
const UserModel = require('./sequelizeUserModel');

const sequelize = new Sequelize('WorkWithTheBest', 'root', 'root', {
	host: 'localhost',
	dialect: 'mysql',
	logging: false,
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
});

const User = UserModel(sequelize, Sequelize);

sequelize.sync()
	.then(() => {
		console.log('Database & tables created');
	});
module.exports = {User};