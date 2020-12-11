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
	addInventory: async (req, res) => {
		let result = "", status = "";
		let quantity = parseInt(req.body.quantity, 10);
		let fileName = req.body.name.toLowerCase().replace(/\s+/g, '-')+".jpeg";
		let fileString = req.body.image;
		var base64Data = fileString.replace(/^data:image\/(png|jpeg);base64,/, "");
		require("fs").writeFile("public/uploads/"+fileName, base64Data, 'base64', function(err) {
			//console.log(err);
		});
		const { name, description, price } = req.body;
		let insertQuery = `INSERT INTO inventory(name, image, description, price, quantity, status)
			VALUES ('${name}', '${"uploads/"+fileName}', '${description}', ${price}, ${quantity}, 'Active');`;
		try {
			const client = await pool.connect();
			result = await client.query(insertQuery);
			result = (result.rowCount >= 1) ? 'Success' : 'Error';
			client.release();
			res.status(200).send(result);
		} catch (error) {
			status = 404;
			result.status = status;
			result.error = error;
			res.status(status).send(result);
		}
	},
	getInventory: async (req, res) => {
		let result = "", status = "";
		try {
			const client = await pool.connect();
			const result = await client.query(`SELECT id, name, image, description, quantity, price, status FROM inventory`);
			const results = { 'results': (result) ? result.rows : null };
			let status = 200;
			res.status(status).send(results);
			client.release();
		} catch (err) {
			res.status(404).send(err);
		}
	},
	deleteInventory: async (req, res) => {
		let result, status = "";
		const ids = req.body.map(item => `'${item}'`).join(",");
		let deleteQuery = `DELETE FROM inventory WHERE id IN (${ids})`;
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
	updateInventory: async (req, res) => {
		let result, fileName;
		const { id, name, image, description, price, status } = req.body;
		let quantity = parseInt(req.body.quantity, 10);
		if (image) {
			fileName = req.body.name.toLowerCase().replace(/\s+/g, '-')+".jpeg";
			let fileString = req.body.image;
			var base64Data = fileString.replace(/^data:image\/(png|jpeg);base64,/, "");
			require("fs").writeFile("public/uploads/"+fileName, base64Data, 'base64', function(err) {
				//console.log(err);
			});
		}
		try {
			const client = await pool.connect();
			let updateQuery = `UPDATE inventory SET `;
			updateQuery = (name) ? updateQuery += `name = '${name}' ` : updateQuery;
			updateQuery = (price) ? updateQuery += `, price = ${price} ` : updateQuery;
			updateQuery = (quantity) ? updateQuery += `, quantity = ${quantity} ` : updateQuery;
			updateQuery = (image) ? updateQuery += `, image = '${"uploads/"+fileName}' ` : updateQuery;
			updateQuery = (description) ? updateQuery += `, description = '${description}' ` : updateQuery;
			updateQuery = (status) ? updateQuery += `, status = '${status}' ` : updateQuery;
			updateQuery = updateQuery += `WHERE id = ${id}`;
			//console.log(updateQuery);
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