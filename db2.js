const mysql = require("mysql2");
const axios = require("axios");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password123",
	database: "currency_exchange",
});

connection.connect();

connection.query(
	`SELECT * FROM crypto
where currency in ('USD','EUR','SGD')`,
	(error, results) => {
		if (error) {
			console.error("Error executing query:", error);
		} else {
			console.log("Query results:", results);
		}

		connection.end((error) => {
			if (error) {
				console.error("Error closing connection:", error);
			} else {
				console.log("Connection closed");
			}
		});
	}
);
