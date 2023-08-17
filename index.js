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
		AND FLOOR(UNIX_TIMESTAMP(entry_date) / 60) * 60  = 
		(SELECT FLOOR(UNIX_TIMESTAMP(MAX(entry_date)) / 60) * 60 
		FROM crypto)`;
		console.log(query);
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
	var base_currency = req.query.base_currency;
	var target_currency = req.query.target_currency;
	var start = parseInt(req.query.start) / 1000;
	if (start < 1692179820) {
		return res.send("Start date is before any records were found.");
	}
	var end = parseInt(req.query.end) / 1000;
	if (end > Date.now() / 1000) {
		return res.send("End date cannot be in the future.");
	}
	if (!end) {
		end = Date.now() / 1000;
	}
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
	connection.query(query, (error, results) => {
		if (error) {
			console.error("Error executing query:", error);
		} else {
			// console.log("Query results:", results);
			historicalData = results.map((row, index) => {
				return { timestamp: incrementTimestamp[index] * 1000, value: row.rate };
			});
			res.status(200).json({ results: historicalData });
		}
	});
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
