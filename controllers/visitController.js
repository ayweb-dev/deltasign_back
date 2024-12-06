import Visit from '../models/visitModel.js';

// Function to cleanup visits to keep only the last 31 days
const cleanupVisits = async () => {
  try {
    // Get all visits ordered by date in descending order
    const visits = await Visit.findAll({
      order: [['date', 'DESC']],
    });
    // If there are more than 31 visits, keep only the last 31
    if (visits.length > 31) {
      const oldVisits = visits.slice(31);
      const oldVisitIds = oldVisits.map(v => v.id);
      await Visit.destroy({ where: { id: oldVisitIds } });
    }
  } catch (error) {
    console.error("Error cleaning up visits:", error);
  }
};

// Function to check and initialize daily visit
// Exported to Schedule cronJob
export const checkAndInitializeDailyVisit = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Check if today's visit exists
    const visit = await Visit.findOne({ where: { date: today } });

    // If no visit exists for today, create it with visits = 0
    if (!visit) {
      await Visit.create({ date: today, visits: 0 });
    }

    // Ensure only the last 31 days of visits are kept
    await cleanupVisits();
  } catch (error) {
    console.error("Error initializing daily visit:", error);
  }
};

// Add visit 
export const addVisit = async (req, res) => {
  try {
    // Take the date of today (only the date without the time)
    const today = new Date().toISOString().split('T')[0];
    // Find the visit of today
    const visit = await Visit.findOne({ where: { date: today } });
    if (visit) {
      // If there is a visit of today
      visit.visits += 1;
      await visit.save();
      return res.status(200).json(visit);
    } else {
      // If there is no visit of today
      const newVisit = await Visit.create({ date: today });
      res.status(201).json(newVisit);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all visits
export const getAllVisits = async (req, res) => {
  try {
    const visits = await Visit.findAll();
    res.status(200).json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

