const mysql = require("mysql2");
const axios = require("axios");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "kawaiprince22",
	database: "currency_exchange",
});

// input variables
const bases = ["btc", "doge"];

// Connect to the database
connection.connect((err) => {
	if (err) {
		console.error("Error connecting to the database:", err);
		return;
	}
	console.log("Connected to the database");
});

// Perform database operations here

async function getData(base) {
	await axios
		.get(`https://api.coinbase.com/v2/exchange-rates?currency=${base}`)
		.then((response) => {
			const jsonData = response.data;
			// Process and store the jsonData in the database
			const currencyRates = jsonData.data.rates;
			for (currency in currencyRates) {
				const sql =
					"INSERT INTO crypto (base, currency, rate) VALUES (?, ?, ?)";
				const values = [
					jsonData.data.currency,
					currency,
					currencyRates[currency],
				];

				connection.query(sql, values, (error, result) => {
					if (error) console.log("Error inserting data:", error);
					else console.log("Data inserted:", result);
				});
			}
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
}
