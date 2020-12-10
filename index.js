require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
var path = require('path');

const app = express();
const router = express.Router();

var dir = path.join(__dirname, 'public');

const environment = process.env.NODE_ENV;
const stage = require('./config')[environment];

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", '*');
	res.header("Access-Control-Allow-Credentials", true);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type');
	next();
});

app.use(express.static(dir));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//app.set('view engine', 'ejs');
const routes = require('./routes/index');
app.use('/pos/v1', routes(router));
app.use('./uploads', express.static('uploads'));
app.listen(`${stage.port}`, () => {
	console.log(`Server now listening at localhost:${stage.port}`);
});

module.exports = app;