// models/Media.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Media = sequelize.define(
  "Media",
  {
    pseudo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    urlMedia: {
      // url du media dans cloudinary
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("image", "video"),
      allowNull: false,
    },
    showInCarousel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    showInPopup: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    usedForNewsLetter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "Medias",
  }
);

export default Media;
