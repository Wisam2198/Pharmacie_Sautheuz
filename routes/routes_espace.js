// routes_espace.js
const express = require('express');
const router = express.Router();

router.get('/espace_pharmaciens', (req, res) => {
  res.render('espace_pharmaciens');
});

module.exports = router;
