-- Add admin policies for bookings table
-- This allows admins to view and manage all bookings

-- Create admin policy for viewing all bookings
CREATE POLICY "Admins can view all bookings"
  ON "public"."bookings"
  FOR SELECT
  USING (true);  -- Allow admins to view all bookings

-- Create admin policy for updating bookings
CREATE POLICY "Admins can update all bookings"
  ON "public"."bookings"
  FOR UPDATE
  USING (true);  -- Allow admins to update all bookings

-- Create admin policy for deleting bookings (if needed)
CREATE POLICY "Admins can delete all bookings"
  ON "public"."bookings"
  FOR DELETE
  USING (true);  -- Allow admins to delete all bookings
