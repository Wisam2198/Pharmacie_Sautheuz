// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const app = express();
const port = 3001;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://tazeredplus:root@pharmaciedb.sl1lu8p.mongodb.net/?retryWrites=true&w=majority";
const loupe = '/image/loupe.png';
const bgpharma = '/image/bg-pharma.jpg';
const croix = '/image/croix.png';

// Connexion à MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Configuration de l'application
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'bankai',
  resave: false,
  saveUninitialized: true
}));

// Définir les chemins des images
app.locals.loupe = loupe;
app.locals.bgpharma = bgpharma;
app.locals.croix = croix;

// Importation des fichiers de routes
const accueilRoutes = require('./routes/routes_accueil');
const aproposRoutes = require('./routes/routes_apropos');
const conditionsRoutes = require('./routes/routes_conditions');
const contactRoutes = require('./routes/routes_contact');
const espaceRoutes = require('./routes/routes_espace');
const faqRoutes = require('./routes/routes_faq');
const gestionRoutes = require('./routes/routes_gestion');
const politiqueRoutes = require('./routes/routes_politique');
const stockRoutes = require('./routes/routes_stock');

// Utilisation des routes dans l'application
app.use(accueilRoutes);
app.use(aproposRoutes);
app.use(conditionsRoutes);
app.use(contactRoutes);
app.use(espaceRoutes);
app.use(faqRoutes);
app.use(gestionRoutes);
app.use(politiqueRoutes);
app.use(stockRoutes);

// Redirection vers /accueil par défaut
app.get('/', (req, res) => {
  res.redirect('/accueil');
});

// Connexion de l'utilisateur
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


app.get('/client/:clientId', async (req, res) => {
  const clientId = req.params.clientId;

  try {
    // Sélectionnez la collection de clients
    const collection = client.db("pharmaciedb").collection("client");

    // Recherchez le client par ID
    const client = await collection.findOne({ _id: ObjectId(clientId) });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Renvoyez les détails du client
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Ajoutez cette route avant la définition de votre route pour gérer les traitements
app.get('/clients', async (req, res) => {
  try {
    const collection = client.db("pharmaciedb").collection("client");
    const clients = await collection.find().toArray();
    res.json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
