import Subscriber from "../models/SubscriberModel.js";

// Fonction pour ajouter un abonné
export const addSubscriber = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Veuillez saisir votre email" });
  }

  // Verify if email is not already in the database
  const existingSubscriber = await Subscriber.findOne({ where: { email } });
  if (existingSubscriber) {
    return res.status(400).json({ message: "Vous êtes déjà inscrit" });
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Veuillez saisir un email valide" });
  }

  try {
    const subscriber = await Subscriber.create({ email });
    //send welcome
    res.status(201).json(subscriber);

    // on doit envoyer un email de bienvenue
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour récupérer tous les abonnés
export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll();
    res.status(200).json({ subscribers: subscribers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour supprimer un abonné
export const deleteSubscriber = async (req, res) => {
  const { id } = req.params;
  try {
    const subscriber = await Subscriber.findByPk(id);

    if (!subscriber) {
      return res.status(404).json({ message: "Abonné non trouvé" });
    }

    await subscriber.destroy();
    res.status(200).json({ message: "Abonné supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
