const { Router } = require("express");
const exchangeController = require("../controllers/exchangeController");

const router = Router();

router.get("/exchange-rates", exchangeController.getExchangeRates);
router.get("/historical-rates", exchangeController.getHistoricalRates);

module.exports = router;
