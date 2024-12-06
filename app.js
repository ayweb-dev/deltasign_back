import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import sequelize from "./config/db.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/", routes);

const allowedOrigins = [process.env.REACT_APP_CLIENT_URL, process.env.REACT_APP_ADMIN_URL];
// Cors configuration avec CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

sequelize
  .sync()
  .then(() => {
    console.log("\nDatabase connected");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export default app;
