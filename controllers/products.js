const { Pool } = require('pg');
const pool = new Pool({
	host: process.env.DBHOST,
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
	port: process.env.DBPORT,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
	database: process.env.DBDATABASE,
	ssl: false 
});

module.exports = {
	addProduct: async (req, res) => {
		console.log(req);
		const { inventory, category, subCategory } = req.body;
		let insertQuery = `INSERT INTO products(categoryid, subcategoryid, inventoryid, status)
			VALUES (${category}, ${subCategory}, '${inventory}', 'Active');`;
		console.log(insertQuery);
		try {
			const client = await pool.connect();
			result = await client.query(insertQuery);
			result = (result.rowCount >= 1) ? 'Sucees' : 'Erro';
			client.release();
			res.status(200).send(result);
		} catch (error) {
			result.error = error;
			res.status(404).send(result);
		}
	},
	getProducts: async (req, res) => {
		let result = "", status = "";
		try {
			const client = await pool.connect();
			const result = await client.query(`SELECT id, categoryid, subcategoryid, inventoryid, status FROM products`);
			const results = { 'results': (result) ? result.rows : null };
			let status = 200;
			res.status(status).send(results);
			client.release();
		} catch (err) {
			res.status(404).send(err);
		}
	},
	deleteProduct: async (req, res) => {
		let result, status = "";
		const ids = req.body.map(item => `'${item}'`).join(",");
		let deleteQuery = `DELETE FROM products WHERE id IN (${ids})`;
		try {
			const client = await pool.connect();
			result = await client.query(deleteQuery);
			result = (result.rowCount >= 1) ? 'success' : 'error';
			status = (result.rowCount >= 1) ? 200 : 500;
			client.release();
			res.status(200).send(result);
		} catch (error) {
			result.error = error;
			res.status(404).send(result);
		}
	},
	updateProduct: async (req, res) => {
		let result;
		const { id, categoryid, subcategoryid, inventoryid, status } = req.body;
		try {
			const client = await pool.connect();
			let updateQuery = `UPDATE products SET `;
			updateQuery = (categoryid) ? updateQuery += `categoryid = '${categoryid}' ` : updateQuery;
			updateQuery = (subcategoryid) ? updateQuery += `, subcategoryid = '${subcategoryid}' ` : updateQuery;
			updateQuery = (inventoryid) ? updateQuery += `, inventoryid = '${inventoryid}' ` : updateQuery;
			updateQuery = (status) ? updateQuery += `, status = '${status}' ` : updateQuery;
			updateQuery = updateQuery += `WHERE id = ${id}`;
			console.log(updateQuery);
			result = await client.query(updateQuery);
			result = (result.rowCount >= 1) ? 'success' : 'error';
			//status = (result.rowCount >= 1) ? 200 : 500;
			res.status(200).send(result);
			client.release();
		} catch (error) {
			result.error = error;
			res.status(404).send(result);
		}
	}
}