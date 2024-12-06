// uploadMiddleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const resourceType = req.body.type;
    return {
      resource_type: resourceType, // Définit si c'est une vidéo ou une image
      folder: "deltasign", // Dossier dans Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "mp4"], // Formats autorisés
    };
  },
});

const upload = multer({ storage: storage });

export default upload;
