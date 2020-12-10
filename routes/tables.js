const controller = require('../controllers/tables');

module.exports = (router) => {
	router.route('/get-tables')
		.get(controller.getTables);
	router.route('/add-table')
		.post(controller.addTable);
	router.route('/update-tables')
		.post(controller.updateTables);
	router.route('/update-table')
		.post(controller.updateTable);
};