const { Pool } = require('pg');
const { nanoid } = require('nanoid');

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
	getInventory: async (req, res) => {
		let result = "", status = "";
		try {
			const client = await pool.connect();
			const result = await client.query(`SELECT 
			prod.id, 
			categoryid, 
			subcategoryid, 
			inventoryid, 
			inv.name,
			inv.image,
			inv.description,
			inv.quantity,
			inv.price
		FROM products prod, inventory inv
		WHERE prod.inventoryid = inv.id`);
			const results = { 'results': (result) ? result.rows : null };
			let status = 200;
			res.status(status).send(results);
			client.release();
		} catch (err) {
			res.status(404).send(err);
		}
	},
	createOrder: async (req, res) => {
		let result = "", status = "";
		const { tableid="", orderCategory } = req.body;
		let date = new Date();
		const orderId = `ORD-${date.getFullYear().toString().substr(2,2)}${date.getMonth() + 1}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
		let insertQuery = `INSERT INTO "order" (orderid, ordercategory, status) VALUES('${orderId}', '${orderCategory}', 'New')`;
		try {
			const client = await pool.connect();
			result = await client.query(insertQuery);
			if (tableid) {
				let updateQuery = `UPDATE tables SET status='Occupied', orderid='${orderId}' WHERE id=${tableid}`;
				result = await client.query(updateQuery);
			}
			/*
			let paymentQuery = `INSERT INTO payment( type, orderid, status ) VALUES ( '', '${orderId}', 'Pending') RETURNING id;`
			paymentResult = await client.query(paymentQuery);
			
			for (let item of items) {
				const { categoryid, subcategoryid, inventoryid, name, image, description, price, quantity } = item;
				let insertOrdetItemsQuery = `INSERT INTO orderitems(
					orderid, categoryid, subcategoryid, inventoryid, name, image, description, price, quantity, tableid)
					VALUES (${orderId}, ${categoryid}, ${subcategoryid}, ${inventoryid}, '${name}', '${image}', '${description}', '${price}', '${quantity}', ${currentTable});`
				await client.query(insertOrdetItemsQuery);
			}
			*/
			result = {
				orderId: orderId
			}
			client.release();
			res.status(200).send(result);
		} catch (error) {
			status = 404;
			result.status = status;
			result.error = error;
			res.status(status).send(result);
		}
	},
	setPayment: async (req, res) => {
		let result = "", status = "";
		const { paymentId, paymentType, paymentStatus, name, phoneNumber, currentTable, orderId, paymentAmount } = req.body;
		try {
			const client = await pool.connect();
			let updateQuery = `UPDATE payment SET type='${paymentType}', status='${paymentStatus}', name='${name}', 
			phonenumber='${phoneNumber}', amount='${paymentAmount}'  WHERE id=${paymentId}`;
			result = await client.query(updateQuery);
			if (currentTable) {
				let updateTableQuery = `UPDATE tables SET status='Available', orderid='' WHERE id=${currentTable}`;
				console.log(updateTableQuery)
				result = await client.query(updateTableQuery);
			}
			const updateOrderQuery = `UPDATE "order" SET status='Completed' WHERE orderid='${orderId}'`;
			const updateResult = await client.query(updateOrderQuery);
			client.release();
			res.status(200).send(result);
		} catch (error) {
			status = 404;
			result.status = status;
			result.error = error;
			res.status(status).send(result);
		}
	},
	getOrderLists: async (req, res) => {
		let result = "", status = "";
		try {
			const client = await pool.connect();
			const result = await client.query(`SELECT "order".orderid, "order".ordercategory, "order".status, 
			tables.name, tables.id as tableid, payment.id as paymentId
			FROM "order" 
			LEFT JOIN tables ON "order".orderid = tables.orderid
			LEFT JOIN payment ON "order".orderid = payment.orderid
			WHERE  "order".status != 'Completed' and "order".ordercategory != 'undefined'`);
			const results = { 'results': (result) ? result.rows : null };
			client.release();
			res.status(200).send(results);
		} catch (err) {
			res.status(404).send(err);
		}
	},
	getOrderItems: async (req, res) => {
		let result = "", status = "";
		const { orderid='' } = req.body;
		try {
			const client = await pool.connect();
			const result = await client.query(`SELECT id, categoryid, subcategoryid, inventoryid, name, image, description, price, quantity, tableid, orderid
			FROM orderitems WHERE orderid = '${orderid}'`);
			const results = { 'results': (result) ? result.rows : null };
			client.release();
			res.status(200).send(results);
		} catch (err) {
			res.status(404).send(err);
		}
	},
	saveOrderItem: async (req, res) => {
		let result = "", status = "";
		let { orderid, categoryid, description, image, inventoryid, name, price, quantity, subcategoryid, tableid = null } = req.body[0];
		try {
			const client = await pool.connect();
			let query = `INSERT INTO orderitems (orderid, categoryid, subcategoryid, inventoryid, name, image, description, price, quantity, tableid) 
			VALUES('${orderid}', '${categoryid}', '${subcategoryid}', '${inventoryid}', '${name}', '${image}', '${description}', '${price}',
			 '${quantity}', ${tableid}) RETURNING id`;
			console.log("query-->", query)
			const result = await client.query(query);
			const updateQuery = `UPDATE "order" SET status='InProgress' WHERE orderid='${orderid}'`;
			const updateResult = await client.query(updateQuery);
			//const results = { 'results': (result) ? result.rows : null };
			results = {
				itemId : result.rows[0].id
			}
			console.log(results)
			client.release();
			res.status(200).send(result);
		} catch (err) {
			res.status(404).send(err);
		}
	},
	updateOrderitem: async (req, res) => {
		let result = "", status = "";
		//console.log("req.body--->", req.body)
		let { data, itemId } = req.body;
		let { categoryid, description, image, inventoryid, name, orderid, price, quantity, subcategoryid, tableid } = data;
		try {
			const client = await pool.connect();
			let query = `UPDATE orderitems
			SET categoryid='${categoryid}', subcategoryid='${subcategoryid}', inventoryid='${inventoryid}', name='${name}', image='${image}', 
			description='${description}', price='${price}', quantity='${quantity}', tableid='${tableid}', orderid='${orderid}'
			WHERE id= '${itemId}'`;
			console.log(query);
			const result = await client.query(query);
			const results = { 'results': (result) ? result.rows : null };
			client.release();
			res.status(200).send(results);
		} catch (err) {
			res.status(404).send(err);
		}
	},
	deletOrderitem: async (req, res) => {
		let result = "", status = "";
		let { itemId } = req.body;
		try {
			const client = await pool.connect();
			let query = `DELETE FROM orderitems WHERE id='${itemId}'`;
			console.log(query)
			const result = await client.query(query);
			//const results = { 'results': (result) ? result.rows : null };
			client.release();
			res.status(200).send(result);
		} catch (err) {
			res.status(404).send(err);
		}
	},
	setDelivery: async (req, res) => {
		let result = "", status = "";
		const { orderid, shippingAddress, city, zipCode } = req.body;
		try {
			const client = await pool.connect();
			let insertQuery = `INSERT INTO delivery(orderid, shippingaddress, city, zipcode)
			VALUES ('${orderid}', '${shippingAddress}', '${city}', '${zipCode}')`;
			result = await client.query(insertQuery);
			client.release();
			res.status(200).send(result);
		} catch (error) {
			status = 404;
			result.status = status;
			result.error = error;
			res.status(status).send(result);
		}
	},
	initiatePayment: async (req, res) => {
		let result = "", status = "";
		const { orderId } = req.body;
		try {
			const client = await pool.connect();
			const countQuery = `SELECT id FROM payment WHERE orderid = '${orderId}'`;
			const countResult = await client.query(countQuery);
			console.log("countResult", countResult);
			if (!countResult.rowCount) {
				let paymentQuery = `INSERT INTO payment( type, orderid, status ) VALUES ( '', '${orderId}', 'Pending') RETURNING id;`
				paymentResult = await client.query(paymentQuery);
			} else {
				let paymentQuery = `SELECT id FROM payment WHERE orderid = '${orderId}'`;
				console.log(paymentQuery)
				paymentResult = await client.query(paymentQuery);
			}
			console.log("paymentResult", paymentResult);
			result = {
				paymentId : paymentResult.rows[0].id
			}
			client.release();
			res.status(200).send(result);
		} catch (error) {
			result.error = error;
			res.status(404).send(result);
		}
	},
	getCompletedOrders: async (req, res) => {
		let result = "", status = "";
		try {
			const client = await pool.connect();
			const result = await client.query(`SELECT "order".orderid as orderId, ordercategory, "order".status, payment.type as paymentType, 
			payment.phonenumber, payment.amount as paymentAmount
			FROM "order"
			JOIN payment ON "order".orderid = payment.orderid
			WHERE "order".status = 'Completed' AND payment.status = 'Completed' ORDER BY "order".id DESC`);
			const results = { 'results': (result) ? result.rows : null };
			client.release();
			res.status(200).send(results);
		} catch (err) {
			res.status(404).send(err);
		}
	},
}