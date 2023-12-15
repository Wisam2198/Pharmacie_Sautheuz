// routes_politique.js
const express = require('express');
const router = express.Router();

router.get('/politique_confidentialite', (req, res) => {
  res.render('politique_confidentialite');
});

module.exports = router;
