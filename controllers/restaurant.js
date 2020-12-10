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
	addRestaurantDetails: async (req, res) => {
		let result = "", status = "";
		const { restName, country, currency, noOfFloors, noOfRooms, clientid  } = req.body;
		let insertQuery = `INSERT INTO restaurant( "business-name", country, currency, "no-of-floor", "no-of-rooms", clientid) VALUES ('${restName}', '${country}', '${currency}', ${noOfFloors}, ${noOfRooms}, '${clientid}')`;
		try {
			const client = await pool.connect();
			result = await client.query(insertQuery);
			result = (result.rowCount >= 1) ? 'success' : 'error';
			client.release();
			res.status(200).send(result);
		} catch (error) {
			 result.error = error;
			res.status(400).send(result);
		}
	},
	getRestaurantDetails: async (req, res) => {
		let result = "", status = "";
		console.log("req-->", req.body)
		try {
			const client = await pool.connect();
			let query = `SELECT id, "business-name", country, currency, "no-of-floor", "no-of-rooms" FROM restaurant `
			if (req.body) {
				query += ` WHERE clientid='${req.body.clientid}'`
			}
			query += ` ORDER BY id DESC`
			const result = await client.query(query);
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
}