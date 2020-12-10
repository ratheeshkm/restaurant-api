const categories = require('./categories');
const subCategories = require("./subCategories");
const products = require('./products');
const inventory = require('./inventory');
const restaurant = require('./restaurant');
const tables = require('./tables');
const orders = require('./orders');
const users = require('./users');

module.exports = (router) => {
	categories(router);
	subCategories(router);
	products(router);
	inventory(router);
	restaurant(router);
	tables(router);
	orders(router);
	users(router);
	return router;
};