import express from "express";
import { login, logout, signup, getStats } from "../controllers/adminController.js";
import { sendContact } from "../controllers/contactController.js";
import {
  createMedia,
  createMediaCarousel,
  createMediaPopup,
  deleteMedia,
  deleteMediaCarousel,
  deleteMediaPopup,
  getActiveMediaPopup,
  getAllMedia,
  getAllMediaCarousel,
  getAllMediaPopup,
  getMedia,
  getMediaCarousel,
  getMediaPopup,
  makeMediaPopupActive,
  updateMediaCarousel,
  updateMediaPopup,
  updateMediaWithMedia,
  updateMediaWithoutMedia,
} from "../controllers/mediaController.js";
import {
  addSubscriber,
  deleteSubscriber,
  getAllSubscribers,
} from "../controllers/subscriberController.js";
import { getAllVisits, addVisit } from "../controllers/visitController.js";
import upload from "../middleware/upload.js";


const router = express.Router();

// Routes Admin
router.post("/admin/signin", signup);
router.post("/admin/login", login);
router.post("/admin/logout", logout);

// Routes Media
router.post("/media", upload.single("file"), createMedia);
router.get("/media", getAllMedia);
router.get("/media/one/:id", getMedia);
router.put(
  "/media/update/withMedia/:id",
  upload.single("file"),
  updateMediaWithMedia
);
router.put("/media/update/withoutMedia/:id", updateMediaWithoutMedia);
router.delete("/media/delete/:id", deleteMedia);

// Routes MediaCarousel
router.get("/media/carousel", getAllMediaCarousel);
router.get("/media/carousel/one/:id", getMediaCarousel);
router.post("/media/carousel", createMediaCarousel);
router.put("/media/carousel/update/:id", updateMediaCarousel);
router.delete("/media/carousel/delete/:id", deleteMediaCarousel);

// Routes MediaPopup
router.get("/media/popup", getAllMediaPopup);
router.get("/media/popup/one/:id", getMediaPopup);
// the Content Field is in html format (eg. <p>hello <strong> world</strong></p>)
router.get("/media/popup/active", getActiveMediaPopup);
router.post("/media/popup", createMediaPopup);
router.put("/media/popup/active/:id", makeMediaPopupActive);
router.put("/media/popup/update/:id", updateMediaPopup);
router.delete("/media/popup/delete/:id", deleteMediaPopup);

// Routes Subscriber
router.get("/subscriber", getAllSubscribers);
router.post("/subscriber", addSubscriber);
router.delete("/subscriber/delete/:id", deleteSubscriber);

// Routes contact
router.post("/contact", sendContact);

// Routes Visit
router.get("/visit", getAllVisits);
router.post("/visit", addVisit);

// Routes Stats
router.get("/stats", getStats);

export default router;
