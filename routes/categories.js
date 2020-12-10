const controller = require('../controllers/categories');
//const validateToken = require('../utils').validateToken;

module.exports = (router) => {
	router.route('/categories')
		.get(controller.getCategories);
	
	router.route('/add-category')
		.post(controller.addCategory)
	
	router.route('/delete-category')
		.post(controller.deleteCategory)
	
	router.route('/update-category')
		.post(controller.updateCategory)
};