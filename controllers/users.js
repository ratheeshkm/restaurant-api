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
  login : async(req, res) => {
    const { username, password } = req.body;
    let result = {};
    try {
			const client = await pool.connect();
			let loginQuery = `SELECT id, name, clientid, email, phone, status FROM client WHERE (email='${username}' and password=crypt('${password}', password)) OR (phone='${username}' and password=crypt('${password}', password)) and status='Active'`;
			result = await client.query(loginQuery);
			const results = (result) ? result.rows : null;
			client.release();
			/*
      const payload = { user: username };
      const options = { expiresIn: '24h', issuer: 'hrs' };
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign(payload, secret, options);
			result.token = token;
			*/
      result.result = results;
      res.status(200).send(result);
    } catch (err) {
      result.error = err;
			res.send("Error " + result);
			res.status(500).send(result);
    }
  }
}