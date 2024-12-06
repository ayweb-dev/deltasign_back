import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const MediaPopup = sequelize.define(
  "MediaPopup",
  {
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
    content: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "mediaPopups",
  }
);

export default MediaPopup;
