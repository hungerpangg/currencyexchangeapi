const mysql = require("mysql2");
const axios = require("axios");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password123",
	database: "currency_exchange",
});

// Connect to the database
connection.connect((err) => {
	if (err) {
		console.error("Error connecting to the database:", err);
		return;
	}
	console.log("Connected to the database");
});

// Perform database operations here

axios
	.get("https://api.coinbase.com/v2/exchange-rates?currency=eth")
	.then((response) => {
		const jsonData = response.data;
		// console.log(jsonData);
		// Process and store the jsonData in the database
		const currencyRates = jsonData.data.rates;
		var data = [];
		for (currency in currencyRates) {
			const values = {
				base: jsonData.data.currency,
				currency,
				rate: currencyRates[currency],
			};
			data.push(values);
		}
		const bulkValues = data
			.map(({ base, currency, rate }) => `('${base}', '${currency}', ${rate})`)
			.join(", ");
		const query = `INSERT INTO crypto (base, currency, rate) VALUES ${bulkValues}`;
		connection.query(query, (error, results) => {
			if (error) {
				console.error("Error inserting data:", error);
			} else {
				console.log("Data inserted:", results.affectedRows);
			}
		});
	})
	.catch((error) => {
		console.error("Error fetching data from API:", error);
	})
	.finally(() => {
		// Close the connection when done
		connection.end((err) => {
			if (err) {
				console.error("Error closing the database connection:", err);
				return;
			}
			console.log("Database connection closed");
		});
	});
