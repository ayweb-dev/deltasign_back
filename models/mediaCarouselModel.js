import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const MediaCarousel = sequelize.define("MediaCarousel", {
  media: {
    type: DataTypes.JSON,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue("media");
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue("media", JSON.stringify(value));
    },
  },
  url: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
});

export default MediaCarousel;
