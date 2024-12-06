import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Subscriber from "../models/SubscriberModel.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "mail.ay-web.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateMailOptions = (mediaCarousel, subscriberEmail) => ({
  from: process.env.EMAIL_USER,
  to: subscriberEmail,
  subject: `New Media Added: ${mediaCarousel.media.title}`,
  text: `Check out our new ${mediaCarousel.media.type}: ${mediaCarousel.media.title}\n\n${mediaCarousel.media.body}\n\n${mediaCarousel.media.urlMedia}`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
        <h1 style="color: #4CAF50;">${mediaCarousel.media.title}</h1>
        <img src="${mediaCarousel.media.imageUrl}" alt="${mediaCarousel.media.title}" style="max-width: 100%; height: auto; border-radius: 10px; margin-bottom: 20px;">
        <p style="font-size: 16px;">${mediaCarousel.media.body}</p>
        <img src="${mediaCarousel.media.urlMedia}" alt="${mediaCarousel.media.title}" style="max-width: 100%; height: auto; border-radius: 10px; margin-top: 20px;">
        <a href="${mediaCarousel.url}" style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Voir la publication</a>
      </div>
    </div>
  `,
});

const sendNewsletter = async (mediaCarousel) => {
  try {
    const subscribers = await Subscriber.findAll();

    const emailPromises = subscribers.map((subscriber) => {
      console.log("Sending to:", subscriber.email);
      return transporter.sendMail(
        generateMailOptions(mediaCarousel, subscriber.email)
      );
    });

    await Promise.all(emailPromises);
    console.log("Newsletter sent successfully.");
  } catch (error) {
    console.error("Error sending newsletter:", error);
  }
};

// Send contact email to admin
const sendContactEmail = async (name, email, phone, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Nouveau Message de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Tel:</strong> ${phone}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Contact email sent successfully.");
    return true;
  } catch (error) {
    console.error("Error sending contact email:", error);
    return false;
  }
};

export { sendContactEmail, sendNewsletter };
