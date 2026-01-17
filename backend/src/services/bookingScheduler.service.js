import pool from "../config/database.js";

/**
 * Service to handle automatic completion of past bookings
 */
class BookingSchedulerService {
  /**
   * Calls the PostgreSQL function to auto-complete past bookings
   * @returns {Promise<number>} Number of bookings updated
   */
  async completePastBookings() {
    try {
      const result = await pool.query("SELECT complete_past_bookings()");
      const updatedCount = result.rows[0].complete_past_bookings;
      
      console.log(`[Booking Scheduler] Completed ${updatedCount} past booking(s) at ${new Date().toISOString()}`);
      
      return updatedCount;
    } catch (error) {
      console.error("[Booking Scheduler] Error completing past bookings:", error);
      throw error;
    }
  }
}

export default new BookingSchedulerService();
