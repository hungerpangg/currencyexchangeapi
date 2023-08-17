const mysql = require("mysql2");

const dbConfig = {
	host: process.env.HOST,
	user: "root",
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
};

function connectDatabase(req, res, next) {
	const connection = mysql.createConnection(dbConfig);

	connection.connect((error) => {
		if (error) {
			console.error("Error connecting to the database:", error);
			res.status(500).send("Database connection error");
		} else {
			req.db = connection;
			next();
		}
	});
}

module.exports = connectDatabase;
