const controller = require('../controllers/users');
//const validateToken = require('../utils').validateToken;

module.exports = (router) => {
  router.route('/login')
		.post(controller.login);
};