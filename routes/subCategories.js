const controller = require('../controllers/subCategories');

module.exports = (router) => {
	
	router.route('/getSubCategories')
		.get(controller.getSubCategories);

	router.route('/addSubCategory')
		.post(controller.addSubCategory)

	router.route('/deleteSubCategories')
		.post(controller.deleteSubCategories)

	router.route('/updateSubCategories')
		.post(controller.updateSubCategories)
};