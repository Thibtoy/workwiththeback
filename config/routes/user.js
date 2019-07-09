module.exports = function(app) {
	const userController = require('../../controllers/userController');

	app.route('/signUp')
		.post(userController.signUp);

	app.route('/login')
		.post(userController.login);

	app.route('/authenticated')
		.post(userController.authenticated);

	app.route('/activateAccount')
		.get(userController.activateAccount);
}