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

app.get("/historical-rates", (req, res) => {
	const connection = req.db;
	const base_currency = req.query.base_currency;
	const target_currency = req.query.target_currency;
	const start = parseInt(req.query.start);
	const end = parseInt(req.query.end);
	let incrementTimestamp = [];
	for (let timestamp = start; timestamp <= end; timestamp += 100) {
		console.log(timestamp);
		incrementTimestamp.push(timestamp);
	}
	let increment = "SELECT";
	for (let timestamp in incrementTimestamp) {
		if (timestamp != incrementTimestamp.length - 1)
			increment += ` ${incrementTimestamp[timestamp]} UNION SELECT`;
		else increment += ` ${incrementTimestamp[timestamp]}`;
	}
	query = `WITH increment AS (${increment})
	SELECT rate, entry_date, floor(UNIX_TIMESTAMP(entry_date) / 60) * 60, UNIX_TIMESTAMP(entry_date) from crypto
	where base='${base_currency}' and currency='${target_currency}'
	and FLOOR(UNIX_TIMESTAMP(entry_date) / 60) * 60 in (select floor(\`${incrementTimestamp[0]}\` / 60) * 60 from increment)`;
	console.log(query);
	connection.query(query, (error, results) => {
		if (error) {
			console.error("Error executing query:", error);
		} else {
			console.log("Query results:", results);
		}
	});
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// WITH increment AS (
// 	SELECT 1692179850 AS num
// 	UNION
// 	SELECT 1692179950
// 	UNION
// 	SELECT 1692180050
// 	UNION
// 	SELECT 1692180150)
// 	SELECT rate, entry_date from currency_exchange.crypto
// 	where base='USD' and currency='ETH'
// 	and floor(UNIX_TIMESTAMP(entry_date) / 60) * 60 in (select floor(num/60)*60 from increment);
