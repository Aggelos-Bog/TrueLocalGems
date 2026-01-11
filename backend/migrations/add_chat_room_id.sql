-- ============================================================
-- Migration: Add chat_room_id to messages table
-- Purpose: Enable explicit chat room grouping for request-based messaging
-- Date: 2026-01-11
-- ============================================================

-- Step 1: Add column (nullable initially for any existing data)
ALTER TABLE messages 
ADD COLUMN chat_room_id VARCHAR(255);

-- Step 2: Clear existing messages (since we're refactoring the messaging system)
-- WARNING: This will delete all existing messages
-- Comment this out if you need to preserve data
TRUNCATE messages CASCADE;

-- Step 3: Make column NOT NULL
ALTER TABLE messages 
ALTER COLUMN chat_room_id SET NOT NULL;

-- Step 4: Add index for performance  
CREATE INDEX idx_messages_chat_room_id ON messages(chat_room_id);

-- Step 5: Optional: Add composite index for room + time ordering
CREATE INDEX idx_messages_room_time ON messages(chat_room_id, send_at);

-- Verify the changes
\d messages
