import cron from "node-cron";
import bookingSchedulerService from "../services/bookingScheduler.service.js";

/**
 * Initialize all scheduled tasks
 */
export function initializeScheduler() {
  console.log("[Scheduler] Initializing scheduled tasks...");

  // Schedule task to run every day at midnight (00:00)
  // Cron format: second minute hour day month weekday
  // '0 0 * * *' means: at 00:00 every day
  cron.schedule("0 0 * * *", async () => {
    console.log("[Scheduler] Running daily booking auto-complete task");
    try {
      await bookingSchedulerService.completePastBookings();
    } catch (error) {
      console.error("[Scheduler] Failed to complete past bookings:", error);
    }
  });

  console.log("[Scheduler] Daily booking auto-complete task scheduled for midnight (00:00)");
}
