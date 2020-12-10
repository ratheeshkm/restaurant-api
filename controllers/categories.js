//const mongoose = require('mongoose');
const User = require('../models/categories');
//const jwt = require('jsonwebtoken');
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

//console.log("pool-->", pool)

module.exports = {
	getCategories: async (req, res) => {
		let result = "", status = "";
		try {
			const client = await pool.connect();
			const result = await client.query(`SELECT id, name, description FROM categories ORDER BY id DESC`);
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
	addCategory: async (req, res) => {
		let result = "", status = "";
		const { name, description } = req.body;
		let insertQuery = `INSERT INTO categories (name, description) VALUES('${name}', '${description}')`;
		//console.log(insertQuery);
		try {
			const client = await pool.connect();
			result = await client.query(insertQuery);
			status = 200;
			//console.log(result);
			result = (result.rowCount >= 1) ? 'success' : 'error';
			client.release();
			res.status(status).send(result);
		} catch (error) {
			status = 404;
			result.status = status;
			result.error = error;
			res.status(status).send(result);
		}
	},
	deleteCategory: async (req, res) => {
		let result, status = "";
		const ids = req.body.map(item => `'${item}'`).join(",");
		let deleteQuery = `DELETE FROM categories WHERE id IN (${ids})`;
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
	updateCategory: async (req, res) => {
		let result, status = "";
		const rows = req.body;
		
		try {
			const client = await pool.connect();
			for (let item of rows) {
				let updateQuery = `UPDATE categories SET name='${item.name}', description='${item.description}' WHERE id=${item.id}`;
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
	}
}