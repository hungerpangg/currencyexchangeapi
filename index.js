require("dotenv").config({ path: "./config.env" });
const express = require("express");
const app = express();
const connectDatabase = require("./middleware/database");
const exchangeRoutes = require("./routes/exchangeRoutes");

app.use(connectDatabase);
app.use(exchangeRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
