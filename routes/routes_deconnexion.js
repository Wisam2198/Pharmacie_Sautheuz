// routes_gestion.js
const express = require('express');
const router = express.Router();

router.get('/deconnexion', (req, res) => {
  res.render('accueil');
});

module.exports = router;
