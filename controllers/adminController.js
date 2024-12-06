// controllers/adminController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Media from "../models/mediaModel.js";
import MediaCarousel from "../models/mediaCarouselModel.js";
import MediaPopup from "../models/mediaPopupModel.js";
import Subscriber from "../models/subscriberModel.js";
import Visit from "../models/visitModel.js";

export const signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Admin.findOne({ where: { username } });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Nom d'utilisateur déjà existant" });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newAdmin = await Admin.create({
      username,
      password: hashedPassword,
    });

    // Retourner une réponse de succès
    res.status(201).json({
      message: "Inscription réussie",
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(404).json({ message: "Identifiants invalides" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Elle sert à rien
export const logout = (req, res) => {
  // Invalidate the token (implementation depends on how you manage tokens, e.g., using a blacklist)
  // For simplicity, we'll just send a success message here
  res.json({ message: "Logout successful" });
};

export const getStats = async (req, res) => {
  try{
    // Number of medias
    const nbrMedias = await Media.count();
    // Number of Media carousel
    const nbrMediaCarousels = await MediaCarousel.count();
    // Number of Media popup
    const nbrMediaPopups = await MediaPopup.count();
    // Number of Subscribers
    const nbrSubscribers = await Subscriber.count();
    // Number of visits this week
    const visits = await Visit.findAll({
      where: {
        date: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      attributes: [[sequelize.fn("SUM", sequelize.col("visits")), "totalVisits"]],
    });
    const nbrVisits = visits[0].dataValues.totalVisits || 0;
    res.status(200).json({ nbrMedias, nbrMediaCarousels, nbrMediaPopups, nbrSubscribers, nbrVisits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}