module.exports = function(app) {
	const dataController = require('../../controllers/dataController');

	app.route('/dataDistricts')
		.get(dataController.dataDistricts);

	app.route('/dataLocations')
		.get(dataController.dataLocations);

	app.route('/dataActivity')
		.get(dataController.dataActivity);

	app.route('/dataUsers')
		.get(dataController.dataUsers);

	app.route('/dataCompanies')
		.get(dataController.dataCompanies);

	app.route('/dataCompaniesOffers')
		.get(dataController.dataCompaniesOffers);

	app.route('/dataUsersOffers')
		.get(dataController.dataUsersOffers);
}