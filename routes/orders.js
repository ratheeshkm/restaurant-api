const { Router } = require('express');
const controller = require('../controllers/orders');

module.exports = (router) => {
	router.route('/get-inventory')
		.get(controller.getInventory);
	router.route('/create-order')
		.post(controller.createOrder);
	router.route('/set-paymet')
		.post(controller.setPayment);
	router.route('/initiate-payment')
		.post(controller.initiatePayment);
	router.route('/get-order-lists')
		.get(controller.getOrderLists);
	router.route('/get-order-items')
		.post(controller.getOrderItems);
	router.route('/save-order-item')
		.post(controller.saveOrderItem);
	router.route('/set-delivery')
		.post(controller.setDelivery);
	router.route('/update-order-item')
		.post(controller.updateOrderitem);
	router.route('/delete-order-item')
		.post(controller.deletOrderitem);
	router.route('/get-completed-orders')
		.get(controller.getCompletedOrders)
}