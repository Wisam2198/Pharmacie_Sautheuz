// routes_gestion.js
const express = require('express');
const router = express.Router();

router.get('/gestion_des_traitements', (req, res) => {
  res.render('gestion_des_traitements');
});

module.exports = router;
