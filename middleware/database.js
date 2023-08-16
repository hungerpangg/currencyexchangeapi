const mysql = require("mysql2");

const dbConfig = {
	host: "localhost",
	user: "root",
	password: "password123",
	database: "currency_exchange",
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
