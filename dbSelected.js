const mysql = require("mysql2");
const axios = require("axios");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password123",
	database: "currency_exchange",
});

// connect to database

// input variables for crypto
const baseCurrenciesForCrypto = ["btc", "doge", "eth"];
const targetCurrenciesForCrypto = ["usd", "eur", "sgd"];

// input variables for fiat
const baseCurrenciesForFiat = ["usd", "eur", "sgd"];
const targetCurrenciesForFiat = ["btc", "doge", "eth"];

async function processCurrencies(baseCurrencies, targetCurrencies) {
	for (let base of baseCurrencies) {
		await insertValues(base, targetCurrencies);
	}
}

async function processAll() {
	// const connection = pool.promise();

	connection.connect((err) => {
		if (err) {
			console.error("Error connecting to the database:", err);
			return;
		}
		console.log("Connected to the database");
	});

	Promise.all([
		processCurrencies(baseCurrenciesForCrypto, targetCurrenciesForCrypto),
		processCurrencies(baseCurrenciesForFiat, targetCurrenciesForFiat),
	])
		.then(() => {
			console.log("All promises have resolved.");
			// connection.end((err) => {
			// 	if (err) {
			// 		console.error("Error closing the database connection:", err);
			// 		return;
			// 	}
			// 	console.log("Database connection closed");
			// });
		})
		.catch((error) => {
			console.error("An error occurred:", error);
		});
}

function closeConnection() {
	connection.end((err) => {
		if (err) {
			console.error("Error closing the database connection:", err);
			return;
		}
		console.log("Database connection closed");
	});
}

// Perform database operations here

async function getExchangeRates(baseCurrency) {
	baseCurrency = baseCurrency.toUpperCase();
	try {
		const response = await axios.get(
			`https://api.coinbase.com/v2/exchange-rates?currency=${baseCurrency}`
		);
		return response.data.data;
	} catch (error) {
		console.error("Error fetching exchange rates:", error);
		return null;
	}
}

async function getSelectedExchangeRates(baseCurrency, targetCurrencies) {
	for (const i in targetCurrencies) {
		targetCurrencies[i] = targetCurrencies[i].toUpperCase();
	}
	const { rates: exchangeRates, currency: base } = await getExchangeRates(
		baseCurrency
	);

	if (exchangeRates) {
		const selectedRates = {};

		for (const targetCurrency of targetCurrencies) {
			if (exchangeRates[targetCurrency]) {
				selectedRates[targetCurrency] = exchangeRates[targetCurrency];
			}
		}
		return { selectedRates, base };
	}
}

async function insertValues(baseCurrency, targetCurrencies) {
	const { selectedRates, base } = await getSelectedExchangeRates(
		baseCurrency,
		targetCurrencies
	);
	var data = [];
	for (currency in selectedRates) {
		const values = {
			base,
			currency,
			rate: selectedRates[currency],
		};
		data.push(values);
	}
	const date = new Date();
	const formattedDate = date.toISOString().slice(0, 19).replace("T", " ");
	const bulkValues = data
		.map(
			({ base, currency, rate }) =>
				`('${base}', '${currency}', ${rate}, '${formattedDate}')`
		)
		.join(", ");
	const query = `INSERT INTO crypto (base, currency, rate, entry_date) VALUES ${bulkValues}`;

	connection.query(query, (error, results) => {
		if (error) {
			console.error("Error inserting data:", error);
		} else {
			console.log("Data inserted:", results.affectedRows);
		}
	});
}

module.exports = {
	processAll,
	closeConnection,
};
