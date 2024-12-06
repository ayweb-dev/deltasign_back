import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Visit = sequelize.define("Visit", {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  visits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

export default Visit;
