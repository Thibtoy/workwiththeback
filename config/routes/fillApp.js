module.exports = function(app) {
	const fillAppController = require('../../controllers/fillAppController.js');

	app.route('/carrousel')
	   .post(fillAppController.carrousel);

	app.route('/wordResearch')
	   .post(fillAppController.wordResearch);

	app.route('/addOffer')
	   .post(fillAppController.addOffer);

	app.route('/offers')
	   .post(fillAppController.offers);

	app.route('/getOffer')
	   .post(fillAppController.getOffer);

	app.route('/updateOffer')
	   .put(fillAppController.updateOffer);
}