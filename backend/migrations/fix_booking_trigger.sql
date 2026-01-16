-- ============================================================
-- FIXED TRIGGER FUNCTION: Booking confirmation logic
-- ------------------------------------------------------------
-- KEY FIX: Changed from AFTER to BEFORE trigger
-- Now modifies NEW directly instead of doing UPDATE
-- This prevents infinite recursion
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_booking_agreement()
RETURNS TRIGGER AS $$
DECLARE
    want_agreed BOOLEAN;
    want_status VARCHAR(20);
BEGIN
    want_agreed := (NEW.traveller_confirmed AND NEW.guide_confirmed);

    IF want_agreed THEN
        want_status := 'confirmed';
    ELSE
        -- If either party has NOT confirmed, we do NOT mark as confirmed.
        IF NEW.status = 'confirmed' THEN
            want_status := 'pending';
        ELSE
            want_status := NEW.status;
        END IF;
    END IF;

    -- BEFORE trigger: modify NEW and return it
    -- No UPDATE needed - just set the fields on NEW
    NEW.agreed := want_agreed;
    NEW.status := want_status;
    NEW.updated_at := CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trg_enforce_booking_agreement ON booking;

-- Create BEFORE trigger (not AFTER)
CREATE TRIGGER trg_enforce_booking_agreement
BEFORE INSERT OR UPDATE
ON booking
FOR EACH ROW
EXECUTE FUNCTION enforce_booking_agreement();
