const User = require('../models/categories');
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
	getTables: async (req, res) => {
		let result = "", status = "";
		try {
			const client = await pool.connect();
			const result = await client.query(`SELECT id, name, "no-of-chaires", floor, room, status FROM tables ORDER BY id ASC`);
			const results = { 'results': (result) ? result.rows : null };
			let status = 200;
			res.status(status).send(results);
			client.release();
		} catch (err) {
			status = 404;
			result.status = status;
			result.error = err;
			res.status(status).send(result);
		}
	},
	addTable: async (req, res) => {
		let result = "";
		const { name, noOfChaires, floor="1", room="1", status="Available" } = req.body;
		let insertQuery = `INSERT INTO tables("no-of-chaires", floor, room, status, name)
		 VALUES ('${noOfChaires}', '${floor}', '${room}', '${status}', '${name}')`;
		//console.log(insertQuery);
		try {
			const client = await pool.connect();
			result = await client.query(insertQuery);
			result = (result.rowCount >= 1) ? 'success' : 'error';
			client.release();
			res.status(200).send(result);
		} catch (error) {
			result.status = 404;
			result.error = error;
			res.status(404).send(result);
		}
	},
	// deleteCategory: async (req, res) => {
	// 	let result, status = "";
	// 	const ids = req.body.map(item => `'${item}'`).join(",");
	// 	let deleteQuery = `DELETE FROM categories WHERE id IN (${ids})`;
	// 	try {
	// 		const client = await pool.connect();
	// 		result = await client.query(deleteQuery);
	// 		result = (result.rowCount >= 1) ? 'success' : 'error';
	// 		status = (result.rowCount >= 1) ? 200 : 500;
	// 		client.release();
	// 		res.status(200).send(result);
	// 	} catch (error) {
	// 		result.error = error;
	// 		res.status(404).send(result);
	// 	}
	// },
	updateTables: async (req, res) => {
		let result, status = "";
		const rows = req.body;
		try {
			const client = await pool.connect();
			for (let item of rows) {
				let updateQuery = `UPDATE tables SET status='${item.status}' WHERE id=${item.id}`;
				result = await client.query(updateQuery);
				result = (result.rowCount >= 1) ? 'success' : 'error';
				status = (result.rowCount >= 1) ? 200 : 500;
			}
			res.status(200).send(result);
			client.release();
		} catch (error) {
			result.error = error;
			res.status(404).send(result);
		}
	},
	updateTable: async (req, res) => {
		let result, statusN = "";
		let { id, status } = req.body;
		try {
			const client = await pool.connect();
			let updateQuery = `UPDATE tables SET status='${status}' WHERE id=${id}`;
			result = await client.query(updateQuery);
			result = (result.rowCount >= 1) ? 'success' : 'error';
			//statusN = (result.rowCount >= 1) ? 200 : 500;
			res.status(200).send(result);
			client.release();
		} catch (error) {
			result.error = error;
			res.status(404).send(result);
		}
	}
}