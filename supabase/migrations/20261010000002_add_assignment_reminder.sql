-- add reminder_sent to assignments
ALTER TABLE assignments ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
