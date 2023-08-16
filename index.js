const express = require("express");
const app = express();
const connectDatabase = require("./middleware/database");

app.use(connectDatabase);

// Define a route
app.get("/exchange-rates", (req, res) => {
	const connection = req.db;
	const base = req.query.base;
	var baseCurrencies = undefined;
	// console.log(base)
	if (base === "crypto") {
		baseCurrencies = ["BTC", "DOGE", "ETH"];
	} else if (base === "fiat") {
		baseCurrencies = ["USD", "EUR", "SGD"];
	}
	if (baseCurrencies) {
		const query = `SELECT * FROM crypto
		WHERE (base = '${baseCurrencies[0]}' 
		OR base = '${baseCurrencies[1]}'
		OR base = '${baseCurrencies[2]}')
		AND CEIL(UNIX_TIMESTAMP(entry_date) / 60) * 60  = 
		(SELECT CEIL(UNIX_TIMESTAMP(MAX(entry_date)) / 60) * 60 
		FROM crypto)`;
		connection.query(query, (error, results) => {
			if (error) {
				console.error("Error executing query:", error);
			} else {
				console.log("Query results:", results);
				const transformedData = {};
				for (const entry of results) {
					const { base, currency, rate } = entry;

					if (!transformedData[base]) {
						transformedData[base] = {};
					}

					transformedData[base][currency] = rate;
				}
				res.json(transformedData);
			}
		});
	} else {
		res.send('Base parameter only accepts the values "fiat" or "crypto"');
	}
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
