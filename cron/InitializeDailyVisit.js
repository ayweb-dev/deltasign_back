import cron from "node-cron";
import { checkAndInitializeDailyVisit } from "./controllers/visitController";

// Schedule a task to run every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running daily visit check and initialization");
  checkAndInitializeDailyVisit();
});
