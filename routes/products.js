const { Router } = require('express');
const controller = require('../controllers/products');

module.exports = (router) => {
	router.route('/add-product')
		.post(controller.addProduct);
	router.route('/get-products')
		.get(controller.getProducts);
	router.route('/delete-product')
		.post(controller.deleteProduct);
	router.route('/update-product')
		.post(controller.updateProduct)
}