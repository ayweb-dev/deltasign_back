import { sendContactEmail } from "../services/emailService.js";

// Send contact email to admin
export const sendContact = async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message || !phone) {
    return res
      .status(400)
      .json({ message: "Veuillez remplir tous les champs obligatoires" });
  }

  try {
    await sendContactEmail(name, email, phone, message);
    res.status(201).json({ message: "Message envoyé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
