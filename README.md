Aim is to implement a currency exchange API (Fiat & Crypto)

### Task 1
Takes in the following query param:
- base: "fiat" | "crypto"
Expected response:
GET /rates?base=crypto

{
   "BTC": {
    "USD": "28541.11500000000000000",
    "EUR": "26241.25000000000000000",
    "SGD": "38841.54632127000000000"
},
  "DOGE": {
    "USD": "0.06793000000000000",
    "EUR": "0.06240000000000000",
    "SGD": "0.09244421610666667"
},
  "ETH": {
    "USD": "1793.72500000012086570",
    "EUR": "1648.99500000006898240",
    "SGD": "2441.14253496683103741"
  }
}

GET /rates?base=fiat  

{
  "USD": {
    "BTC": "0.00003582174455120",
    "DOGE": "15.26018617427132610",
    "ETH": "0.00057606009458910"
},
  "EUR": {
    "BTC": "0.00003889317037870",
    "DOGE": "16.57000828500414250",
    "ETH": "0.00062553365840230"
},
  "SGD": {
    "BTC": "0.00002634212533831",
    "DOGE": "11.22314969136023336",
    "ETH": "0.00042351386383569"
  }
}

* We are only interested in the 3 Fiat Currencies (USD, SGD, EUR) and the 3 Crypto Currencies (BTC, DOGE, ETH)
* We will use the free Coinbase API to get the information required - https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates

### Task 2: Persistent store
* Create a persistent store for the currency exchange data and connect it to your backend
* Implement a mechanism where your service will regularly update the persistent store with the latest currency exchange data

### Task 3: Visualization data
* To serve data to a visualization tool
* We want to show how currency pairs vary in relation to each other over time
* Please create the following API to accept the following parameters and return the response as shown below:

GET /historical-rates?base_currency=USD&target_currency=ETH&start=1692179820000&end=1692180120000

#### Query parameters
base_currency - the reference base currency. 1 unit of this currency should be compared against the target_currency below.
target_currency - the target currency. The API should return the amount of target_currency 1 unit of base_currency can be exchanged for
start - the starting Unix timestamp in UTC, in milliseconds.
end - (Optional) The ending Unix timestamp in UTC (in milliseconds). If undefined, it assume the current time.

Sample Response (JSON):

{
  results: \[
    {
      "timestamp": 1692179820000,
      "value": '29118.18500000000000000'
    },
    {
      "timestamp": 1692179920000,
      "value": '29123.20500000000000000'
    },
    {
      "timestamp": 1692180020000,
      "value": '29137.71500000000000000'
    },
    {
      "timestamp": 1692180120000,
      "value": '29154.44500000000000000'
    },
    // ...more results
      \]
}

### How to use
Run `node cron.js` to start pulling data from the API and storing it the database. Interval in which the file pulls from API can be customized (currently set at 60 seconds).  
Run `npm start` separately to make API available, where it will pull the latest data or historical data from database.

* for historical-rates API, cannot pull before earliest date that currency data is stored in database. Earliest date must be set in the file (have been set at UTC 1692179820 seconds for development purposes).

### `npm start`
Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `node cron.js`
Run scheduler to pull data from exchange currency API and store it in MySQL database.
