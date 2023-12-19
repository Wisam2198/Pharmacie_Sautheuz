const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const app = express();
const port = 3001;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
  connectTimeoutMS: 30000,
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

app.get('/liste_medicaments', async (req, res) => {
  try {
    const db = client.db('pharmaciedb');
    const collection = db.collection('medicament');
    const listeMedicaments = await collection.find({}).toArray();

    // Transformation de la liste
    const formattedList = listeMedicaments.map(medicament => ({
      nom: medicament.nom,
    }));

    // Envoi de la liste transformée
    res.status(200).json(formattedList);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des médicaments:", error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la liste des médicaments', error: error.message });
  }
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

// Route POST pour /deconnexion
app.post('/deconnexion', (req, res) => {
  // Déconnecter l'utilisateur en détruisant la session
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion :', err);
      res.status(500).json({ message: 'Erreur serveur lors de la déconnexion', error: err.message });
    } else {
      // Rediriger vers la page d'accueil après la déconnexion
      res.redirect('/accueil');
    }
  });
});

app.get('/clients', async (req, res) => {
  try {
    const db = client.db('pharmaciedb');
    const collection = db.collection('client');
    const listeClients = await collection.find({}).toArray();

    // Transformation de la liste
    const formattedList = listeClients.map(clients => ({
      nom: clients.nom,
      prenom: clients.prenom,
    }));

    // Envoi de la liste transformée
    res.status(200).json(formattedList);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des clients:", error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la liste des clients', error: error.message });
  }
});

// Ajouter des médicaments
app.post('/ajouter_medicament', async (req, res) => {
  const { stockDisponible, nomMedicament } = req.body[0];
  let stockResult;
  let database;

  try {
    database = client.db("pharmaciedb");

    const newStock = new Stock({ quantite: parseInt(stockDisponible) });

    const stockCollection = database.collection('stock');
    await stockCollection.createIndex({ quantite: 1 });

    stockResult = await stockCollection.insertOne(newStock);
    console.log("Stock ajouté avec succès:", stockResult);
  } catch (error) {
    console.error("Erreur lors de l'ajout du stock:", error.message);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du stock', error: error.message });
  }

  try {

    const newMedicament = new Medicament({
      nom: nomMedicament,
      stock_id: stockResult.insertedId,
    });

    const medicamentCollection = database.collection('medicament');
    await medicamentCollection.createIndex({ nom: 1 });

    const medicamentResult = await medicamentCollection.insertOne(newMedicament);
    console.log("Médicament ajouté avec succès:", medicamentResult);

    res.status(201).json({ message: 'Médicament ajouté avec succès' });
  } catch (error) {
    console.error("Erreur lors de l'ajout du médicament:", error.message);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du médicament', error: error.message });
  }
});

// Modifier le stock
app.post('/modifier_stock', async (req, res) => {
  const { nouveauStock, selectedMedicament } = req.body;
  let database;

  try {
    database = client.db("pharmaciedb");

    // Trouver le stock_id du médicament sélectionné
    const medicamentCollection = database.collection('medicament');
    const selectedMedicamentInfo = await medicamentCollection.findOne({ nom: selectedMedicament });

    if (!selectedMedicamentInfo) {
      return res.status(404).json({ message: 'Médicament non trouvé' });
    }

    const stock_id = selectedMedicamentInfo.stock_id;

    // Mettre à jour la quantité du stock
    const stockCollection = database.collection('stock');
    const result = await stockCollection.updateOne(
      { _id: stock_id },
      { $set: { quantite: parseInt(nouveauStock) } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du stock' });
    }

    res.status(200).json({ message: 'Stock modifié avec succès' });
  } catch (error) {
    console.error("Erreur lors de la modification du stock:", error.message);
    res.status(500).json({ message: 'Erreur serveur lors de la modification du stock', error: error.message });
  }
});

// App pour supprimer un médicament et son stock associé
app.delete('/supprimer_medicament', async (req, res) => {
  const selectedMedicament = req.body.selectedMedicament;
  console.log(selectedMedicament);

  let database;

  try {
    database = client.db("pharmaciedb");

    // Supprime le médicament associé au stock
    const medicamentCollection = database.collection('medicament');
    const stockCollection = database.collection('stock');

    const medicamentResult = await medicamentCollection.findOne({ nom: selectedMedicament });

    if (medicamentResult) {
      const stockId = medicamentResult.stock_id;

      // Maintenant, supprime le stock
      const stockResult = await stockCollection.deleteOne({ _id: new ObjectId(stockId) });

      if (stockResult.deletedCount === 1) {
        // Stock supprimé avec succès

        // Maintenant, supprime le médicament
        const medicamentDeleteResult = await medicamentCollection.deleteOne({ nom: selectedMedicament });

        if (medicamentDeleteResult.deletedCount === 1) {
          // Médicament supprimé avec succès
          res.status(200).json({ message: 'Médicament et stock supprimés avec succès' });
        } else {
          // Échec de la suppression du médicament
          res.status(500).json({ message: 'Erreur serveur lors de la suppression du médicament' });
        }
      } else {
        // Échec de la suppression du stock
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du stock' });
      }
    } else {
      // Le médicament n'a pas été trouvé
      res.status(404).json({ message: 'Médicament non trouvé' });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du médicament et du stock:", error.message);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du médicament et du stock', error: error.message });
  }
});


// Connexion à la base de données MongoDB
async function run() {
  try {
    await client.connect();
    await client.db("pharmaciedb").command({ ping: 1 });
    console.log("La BDD est connectée");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error);
    throw error; 
  } finally {

  }
}

// Démarrage de l'application et écoute du port spécifié
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution à http://localhost:${port}`);
});
