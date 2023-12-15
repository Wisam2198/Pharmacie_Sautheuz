// routes_apropos.js
const express = require('express');
const router = express.Router();

router.get('/a_propos', (req, res) => {
  res.render('a_propos');
});

module.exports = router;
