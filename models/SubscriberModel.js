import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Subscriber = sequelize.define("Subscriber", {
  email: {
    unique: true,
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateSub: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Subscriber;
