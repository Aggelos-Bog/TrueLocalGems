import cron from "node-cron";
import bookingSchedulerService from "../services/bookingScheduler.service.js";

/**
 * Initialize all scheduled tasks
 */
export function initializeScheduler() {
  console.log("[Scheduler] Initializing scheduled tasks...");

  // Schedule task to run every 5 minutes
  // Cron format: second minute hour day month weekday
  // '0 */5 * * * *' means: At second 0, every 5 minutes
  cron.schedule("0 */5 * * * *", async () => {
    console.log("[Scheduler] Running booking auto-complete task (Every 5 mins)");
    try {
      await bookingSchedulerService.completePastBookings();
    } catch (error) {
      console.error("[Scheduler] Failed to complete past bookings:", error);
    }
  });

  console.log("[Scheduler] Booking auto-complete task scheduled for every 5 minutes");
}