import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import MediaCarousel from "../models/mediaCarouselModel.js";
import Media from "../models/mediaModel.js";
import MediaPopup from "../models/mediaPopupModel.js";
import { sendNewsletter } from "../services/emailService.js";

dotenv.config();

// Fonction pour gérer l'ajout d'un média
export const createMedia = async (req, res) => {
  try {
    // Vérification du fichier
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier sélectionné." });
    }

    // Créer un enregistrement dans la base de données
    const { pseudo, title, body, type } = req.body;
    const media = await Media.create({
      pseudo,
      title,
      body,
      urlMedia: req.file.path,
      type,
    }).catch((error) => {
      console.error("Erreur lors de l'ajout du média : ", error);
      throw error; // Re-lancer l'erreur pour la gestion du catch global
    });

    // Réponse réussie
    res.status(201).json({ media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all media entries
export const getAllMedia = async (req, res) => {
  try {
    const media = await Media.findAll();
    res.status(200).json({ medias: media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a media entry by ID
export const getMedia = async (req, res) => {
  const { id } = req.params;

  try {
    const media = await Media.findByPk(id);
    if (!media) {
      return res.status(404).json({ message: "Media non trouvé" });
    }

    res.status(200).json({ media: media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a media entry with media updated (video or image)
export const updateMediaWithMedia = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérification du fichier
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier sélectionné." });
    }

    const media = await Media.findByPk(id);
    const { pseudo, title, body, type } = req.body;

    if (!media) {
      return res.status(404).json({ message: "Media non trouvé" });
    }

    // Updating the media
    media.pseudo = pseudo;
    media.title = title;
    media.body = body;
    media.type = type;
    media.urlMedia = req.file.path;
    await media.save();

    // Update MediaCarousel which are using this media
    const mediaCarousels = await MediaCarousel.findAll();
    for (let mediaCarousel of mediaCarousels) {
      let mediaData = mediaCarousel.media;
      if (mediaData.id === id) {
        mediaData.pseudo = pseudo;
        mediaData.title = title;
        mediaData.body = body;
        mediaData.type = type;
        mediaData.urlMedia = req.file.path;
        mediaCarousel.media = mediaData;
        await mediaCarousel.save();
      }
    }
    // Update MediaPopup which are using this media
    const mediaPopups = await MediaPopup.findAll();
    for (let mediaPopup of mediaPopups) {
      let mediaData = mediaPopup.media;
      if (mediaData.id === id) {
        mediaData.pseudo = pseudo;
        mediaData.title = title;
        mediaData.body = body;
        mediaData.type = type;
        mediaData.urlMedia = req.file.path;
        mediaPopup.media = mediaData;
        await mediaPopup.save();
      }
    }

    res.status(200).json({ message: "Media mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a media entry without media(video or image) updated
export const updateMediaWithoutMedia = async (req, res) => {
  const { id } = req.params;

  try {
    const media = await Media.findByPk(id);
    const { pseudo, title, body } = req.body;

    if (!media) {
      return res.status(404).json({ message: "Media non trouvé" });
    }

    // Update media attributes
    media.pseudo = pseudo;
    media.title = title;
    media.body = body;
    await media.save();

    // Update MediaCarousel which are using this media
    const mediaCarousels = await MediaCarousel.findAll();
    for (let mediaCarousel of mediaCarousels) {
      let mediaData = mediaCarousel.media;
      if (String(mediaData.id) === String(id)) {
        mediaData.pseudo = pseudo;
        mediaData.title = title;
        mediaData.body = body;
        mediaCarousel.media = mediaData;
        await mediaCarousel.save();
      }
    }
    // Update MediaPopup which are using this media
    const mediaPopups = await MediaPopup.findAll();
    for (let mediaPopup of mediaPopups) {
      let mediaData = mediaPopup.media;
      if (String(mediaData.id) === String(id)) {
        mediaData.pseudo = pseudo;
        mediaData.title = title;
        mediaData.body = body;
        mediaPopup.media = mediaData;
        await mediaPopup.save();
      }
    }
    res.status(200).json({ message: "Media mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a media entry
export const deleteMedia = async (req, res) => {
  const { id } = req.params;

  try {
    const media = await Media.findByPk(id);

    if (!media) {
      return res.status(404).json({ message: "Media non trouvé" });
    }

    //make sure that the media is not used in the carousel
    if (media.showInCarousel) {
      return res.status(400).json({
        message:
          "le Media est utilisé dans le carousel et ne peut pas être supprimé",
      });
    }

    //make sure that the media is not used in the popup
    if (media.showInPopup) {
      return res.status(400).json({
        message:
          "le Media est utilisé dans le popup et ne peut pas être supprimé",
      });
    }

    //make sure that the media is not used in the newsletter
    //managed in the front end

    // Delete media from Cloudinary
    const publicId = media.urlMedia.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    // Delete media from the database after deleting from Cloudinary
    await media.destroy();

    res.status(200).json({ message: "Media supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//*******************************/
//******* Media Carousel ********/
//*******************************/

// Create media carousel entry
export const createMediaCarousel = async (req, res) => {
  const { id, url, publichInNewsletter } = req.body;

  if (!id || !url) {
    return res
      .status(400)
      .json({ message: "Veuillez choisir un Media et/ou fournir une url" });
  }

  try {
    const media = await Media.findByPk(id);

    if (!media) {
      return res.status(404).json({ message: "Media non trouvé" });
    }

    // make sure that the media is not already in the carousel
    if (media.showInCarousel) {
      return res.status(400).json({
        message: "le Media est déjà dans le carousel",
      });
    }

    // Update media attribute to show in carousel
    media.showInCarousel = true;
    await media.save();

    // Update media Carousels attribute 'showInPopup' to true
    const mediaPopups = await MediaPopup.findAll();
    for (let mediaPopup of mediaPopups) {
      let mediaData = mediaPopup.media;
      if (mediaData.id === id) {
        mediaData.showInPopup = true;
        mediaPopup.media = mediaData;
        await mediaPopup.save();
      }
    }

    // Create media carousel entry
    const mediaCarousel = await MediaCarousel.create({
      media: media,
      url: url,
    });

    // Send media to newsletter if required
    if (publichInNewsletter) {
      if (media.type === "video") {
        return res.status(500).json({
          message: "Vous ne pouvez pas publier une vidéo dans la newsletter",
        });
      } else {
        await sendNewsletter(mediaCarousel);

        media.usedForNewsLetter = true;
        await media.save();

        mediaCarousel.media.usedForNewsLetter = true;
      }
    }

    res.status(200).json({ message: "Media ajouté au carousel" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all media carousel entries
export const getAllMediaCarousel = async (req, res) => {
  try {
    const mediaCarousel = await MediaCarousel.findAll();

    res.status(200).json({ medias: mediaCarousel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a media carousel entry by ID
export const getMediaCarousel = async (req, res) => {
  const { id } = req.params;

  try {
    const mediaCarousel = await MediaCarousel.findByPk(id);
    if (!mediaCarousel) {
      return res.status(404).json({ message: "Media Carousel non trouvé" });
    }

    res.status(200).json({ mediaCarousel: mediaCarousel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a media carousel entry
export const updateMediaCarousel = async (req, res) => {
  const { id } = req.params;
  const { url } = req.body;

  try {
    const mediaCarousel = await MediaCarousel.findByPk(id);
    if (!mediaCarousel) {
      return res.status(404).json({ message: "Media Carousel non trouvé" });
    }

    mediaCarousel.url = url;
    await mediaCarousel.save();
    return res.status(200).json({ message: "Media Carousel mis à jours" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a media carousel entry
export const deleteMediaCarousel = async (req, res) => {
  const { id } = req.params;

  try {
    const mediaCarousel = await MediaCarousel.findByPk(id);

    if (!mediaCarousel) {
      return res.status(404).json({ message: "Media Carousel non trouvé" });
    }

    // Update media attribute to not show in carousel
    const media = await Media.findByPk(mediaCarousel.media.id);
    media.showInCarousel = false;
    await media.save();

    await mediaCarousel.destroy();

    res.status(200).json({ message: "Media Carousel supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//*******************************/
//******* Media Popup **********/
//*******************************/

// Create media popup entry
export const createMediaPopup = async (req, res) => {
  const { id, content } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Veuillez choisir un Media" });
  }

  try {
    const media = await Media.findByPk(id);

    if (!media) {
      return res.status(404).json({ message: "Media non trouvé" });
    }

    // make sure that the media is not already in the popup
    if (media.showInPopup) {
      return res.status(400).json({
        message: "le Media est déjà dans le popup",
      });
    }

    // Update media attribute to show in popup
    media.showInPopup = true;
    await media.save();

    // Update media Carousels attribute 'showInPopup' to true
    const mediaCarousels = await MediaCarousel.findAll();
    for (let mediaCarousel of mediaCarousels) {
      let mediaData = mediaCarousel.media;
      if (mediaData.id === id) {
        mediaData.showInPopup = true;
        mediaCarousel.media = mediaData;
        await mediaCarousel.save();
      }
    }

    console.log("\n\n hhhh \n\n");

    // Create media popup entry
    const mediaPopup = await MediaPopup.create({
      media: media.toJSON(),
      content: content,
    });
    console.log("\n\n hhhh \n\n");

    // make active = true if it is the first popup
    const popups = await MediaPopup.findAll();
    if (popups.length === 1) {
      mediaPopup.active = true;
      await mediaPopup.save();
    }

    res.status(200).json({ message: "Media ajouté au popup" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all media popup entries
export const getAllMediaPopup = async (req, res) => {
  try {
    const mediaPopup = await MediaPopup.findAll();
    res.status(200).json({ medias: mediaPopup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a media popup entry by ID
export const getMediaPopup = async (req, res) => {
  const { id } = req.params;

  try {
    const mediaPopup = await MediaPopup.findByPk(id);
    if (!mediaPopup) {
      return res.status(404).json({ message: "Media Popup non trouvé" });
    }

    res.status(200).json({ mediaPopup: mediaPopup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active media popup entry
export const getActiveMediaPopup = async (req, res) => {
  try {
    const mediaPopup = await MediaPopup.findOne({ where: { active: true } });
    if (!mediaPopup) {
      return res
        .status(404)
        .json({ message: "Aucun media popup n'est activé" });
    }

    res.status(200).json({ mediaPopup: mediaPopup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Make a media popup active
export const makeMediaPopupActive = async (req, res) => {
  const { id } = req.params;

  try {
    const mediaPopup = await MediaPopup.findByPk(id);

    if (!mediaPopup) {
      return res.status(404).json({ message: "Media Popup non trouvé" });
    }

    // make sure that the mediaPopup is not already active
    const activePopup = await MediaPopup.findOne({ where: { active: true } });
    if (activePopup) {
      activePopup.active = false;
      await activePopup.save();
    }

    // make the selected popup active
    mediaPopup.active = true;
    await mediaPopup.save();

    res.status(200).json({ message: "Media Popup mis à jours avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a media popup entry
export const updateMediaPopup = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const mediaPopup = await MediaPopup.findByPk(id);

    if (!mediaPopup) {
      return res.status(404).json({ message: "Media Popup non trouvé" });
    }

    mediaPopup.content = content;
    await mediaPopup.save();

    res.status(200).json({ message: "Media Popup mis à jours avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a media popup entry
export const deleteMediaPopup = async (req, res) => {
  const { id } = req.params;

  try {
    const mediaPopup = await MediaPopup.findByPk(id);

    if (!mediaPopup) {
      return res.status(404).json({ message: "Media Popup non trouvé" });
    }

    // Update media attribute to not show in carousel
    const media = await Media.findByPk(mediaPopup.media.id);
    media.showInPopup = false;
    await media.save();

    // Delete media popup from the database
    await mediaPopup.destroy();

    if (mediaPopup.active) {
      // make the first popup active
      const popups = await MediaPopup.findAll();
      if (popups.length > 0) {
        popups[0].active = true;
        await popups[0].save();
      }
    }

    res.status(200).json({ message: "Media Popup supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
