// routes_stock.js
const express = require('express');
const router = express.Router();

router.get('/stock_de_medicaments', (req, res) => {
  res.render('stock_de_medicaments');
});

module.exports = router;
