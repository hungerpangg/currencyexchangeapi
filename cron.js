const cron = require("node-cron");
const { processAll, closeConnection } = require("./dbSelected");

let iterationCount = 0;
const maxIterations = 10; // Set the maximum number of iterations
const interval = "*/70 * * * * *"; // Schedule to run every 10 seconds

function cronJob() {
	console.log("Running process to pull data from api to database...");
	processAll();
	iterationCount++;

	if (iterationCount >= maxIterations) {
		console.log("Stopping the process...");
		closeConnection();
		cronJob.stop(); // Stop the task after reaching the maximum iterations
	}
}

cron.schedule(interval, cronJob);
