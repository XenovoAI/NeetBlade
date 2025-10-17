-- Add new columns to materials table for price, thumbnail, and payment link
-- Run this in Supabase SQL Editor

-- Add price column (required for all materials)
ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Add thumbnail_url column (optional)
ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add payment_link column (generated automatically based on price)
ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS payment_link TEXT;

-- Add comment to describe the columns
COMMENT ON COLUMN materials.price IS 'Price of the study material in Indian Rupees';
COMMENT ON COLUMN materials.thumbnail_url IS 'URL to the thumbnail/preview image of the material';
COMMENT ON COLUMN materials.payment_link IS 'Razorpay payment link for this specific material';

-- Create a function to automatically generate payment link when price is set
CREATE OR REPLACE FUNCTION generate_payment_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS NOT NULL AND NEW.price > 0 THEN
    NEW.payment_link := 'https://razorpay.me/@teamneetblade/' || NEW.price::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate payment link on insert/update
DROP TRIGGER IF EXISTS auto_generate_payment_link ON materials;
CREATE TRIGGER auto_generate_payment_link
  BEFORE INSERT OR UPDATE OF price ON materials
  FOR EACH ROW
  EXECUTE FUNCTION generate_payment_link();

-- Optional: Update existing materials with a default price (if needed)
-- UPDATE materials SET price = 299 WHERE price IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials' 
ORDER BY ordinal_position;
