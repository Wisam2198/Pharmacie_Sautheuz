// routes_conditions.js
const express = require('express');
const router = express.Router();

router.get('/conditions_utilisation', (req, res) => {
  res.render('conditions_utilisation');
});

module.exports = router;
