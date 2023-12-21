// routes_accueil.js
const express = require('express');
const router = express.Router();

router.get('/accueil', (req, res) => {
  const utilisateur = req.session.utilisateur || null; // Si l'utilisateur n'est pas défini, utilisez null
  res.render('accueil', { utilisateur });
});

module.exports = router;
