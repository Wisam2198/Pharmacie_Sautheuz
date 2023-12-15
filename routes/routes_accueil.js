// routes_accueil.js
const express = require('express');
const router = express.Router();

router.get('/accueil', (req, res) => {
  res.render('accueil', { utilisateur: req.session.utilisateur });
});

module.exports = router;
