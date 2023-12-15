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
  },
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

// Création des modèles mongoose

const stockSchema = new mongoose.Schema({
  quantite: Number
});

const Stock = mongoose.model('stock', stockSchema); 

const medicamentSchema = new mongoose.Schema({
  nom: String,
  stock_id: { type: mongoose.Schema.Types.ObjectId, ref: 'stock' } 
});

const Medicament = mongoose.model('medicament', medicamentSchema); 


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

// Ajouter des médicaments
app.post('/ajouter_medicament', async (req, res) => {

  const medicaments = req.body;

  console.log(medicaments);
  console.log(medicaments.map(medicament => ({ quantite: medicament.stockDisponible })));

  //dataStock = {
    //quantite: medicament.stockDisponible
  //}

  //Stock.insertMany([data])

});

/* Ajouter des médicaments
app.post('/ajouter_medicament', async (req, res) => {
  const medicaments = req.body;

  console.log(medicaments);

  try {
    if (!medicaments || !Array.isArray(medicaments)) {
      return res.status(400).json({ message: 'Les données sont incorrectes' });
    }

    const stocks = medicaments.map(medicament => ({ quantite: medicament.stockDisponible }));
    
    try {
      const savedStocks = await Stock.insertMany(stocks);
      console.log(savedStocks);

      const medicamentDocs = savedStocks.ops.map((savedStock, index) => ({
        nom: medicaments[index].nomMedicament,
        stock_id: savedStock._id
      }));

      console.log(medicamentDocs);

      const savedMedicaments = await Medicament.insertMany(medicamentDocs);

      console.log(savedMedicaments);

      res.status(201).json(savedMedicaments);
    } catch (error) {
      console.error("Error inserting stocks:", error);
      res.status(500).json({ message: 'Error inserting stocks', error: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/


// Connexion à la base de données MongoDB
async function run() {
  try {
    await client.connect();
    await client.db("pharmaciedb").command({ ping: 1 });
    console.log("La BDD est connectée");
  } finally {
    // Actions à effectuer après la connexion à la base de données, si nécessaire
  }
}

// Démarrage de l'application et écoute du port spécifié
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution à http://localhost:${port}`);
});
