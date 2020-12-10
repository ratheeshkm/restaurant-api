const routes = require('.');
const controller = require('../controllers/restaurant');

module.exports = (router) => {
	router.route('/get-restaurant-details')
		//.get(controller.getRestaurantDetails);
		.post(controller.getRestaurantDetails);
	router.route('/add-restaurant-details')
		.post(controller.addRestaurantDetails);
}