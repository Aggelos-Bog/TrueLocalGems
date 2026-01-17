-- ============================================================
-- MIGRATION: Add auto-complete functionality for past bookings
-- Date: 2026-01-17
-- Description: Automatically mark confirmed bookings as completed
--              when their date has passed
-- ============================================================

-- Function to batch-update past bookings to 'completed' status
CREATE OR REPLACE FUNCTION complete_past_bookings()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE booking
    SET status = 'completed',
        updated_at = CURRENT_TIMESTAMP
    WHERE date < CURRENT_DATE
      AND status = 'confirmed';

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Run once immediately to update any existing past bookings
SELECT complete_past_bookings();
