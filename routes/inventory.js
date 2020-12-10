const { Router } = require('express');
const controller = require('../controllers/inventory');

module.exports = (router) => {
	router.route('/add-inventory')
		.post(controller.addInventory);
	router.route('/get-inventory')
		.get(controller.getInventory);
	router.route('/delete-inventory')
		.post(controller.deleteInventory);
	router.route('/update-inventory')
		.post(controller.updateInventory)
}