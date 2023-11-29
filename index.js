const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const app = express();
const port = 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://tazeredplus:root@pharmaciedb.sl1lu8p.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

app.use(session({
  secret: 'bankai', 
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  const loupe = '/image/loupe.png';
  const bgpharma = '/image/bg-pharma.jpg';
  const croix = '/image/croix.png';
  const utilisateur = req.session.utilisateur || null; // Assurez-vous que la variable utilisateur est correctement définie
  res.render('accueil', { loupe, bgpharma, croix, utilisateur });
});


app.post('/connexion', async (req, res) => {
  const { pseudo, mdp } = req.body;

  try {
    const utilisateur = await client.db("pharmaciedb").collection("utilisateur").findOne({ pseudo, mdp });

    if (utilisateur) {
      req.session.utilisateur = utilisateur;
      res.status(200).json({ message: 'Connexion réussie' });
    } else {
      res.status(401).json({ message: 'Identifiants invalides' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/deconnexion', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    } else {
      res.redirect('/');
    }
  });
});


app.get('/espace_pharmaciens', (req, res) => {
  
  
  if (req.session.utilisateur) {
    const loupe = '/image/loupe.png';
    res.render('espace_pharmaciens', {loupe});
  } else {
    res.redirect('/');
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("pharmaciedb").command({ ping: 1 });
    console.log("La BDD est connectée");
  } finally {

  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
