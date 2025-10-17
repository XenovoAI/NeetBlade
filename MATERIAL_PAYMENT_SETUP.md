# Study Material Payment System - Complete Setup Guide

## Overview
The study materials upload system has been enhanced to include:
1. **Price field** - Set individual prices for each material
2. **Thumbnail images** - Upload preview images for materials
3. **Auto-generated payment links** - Razorpay links created automatically based on price

## Features Added

### 1. Enhanced Upload Modal
When uploading study materials, admins can now:
- Set a price for the material (required)
- Upload a thumbnail/preview image (optional, max 5MB)
- Automatically generate Razorpay payment link based on price
- Preview the payment link before uploading

### 2. Enhanced Materials Table
The admin materials table now displays:
- **Thumbnail column** - Shows preview image or default icon
- **Price column** - Displays material price in ₹
- **Payment Link column** - Quick copy and open buttons for payment links
- All existing columns (Title, Subject, Size, Upload Date, Actions)

## Database Schema Updates

### Required Supabase Changes
Run the following SQL in your Supabase SQL Editor:

```sql
-- Add new columns to materials table
ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS payment_link TEXT;

-- Create auto-generation function
CREATE OR REPLACE FUNCTION generate_payment_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS NOT NULL AND NEW.price > 0 THEN
    NEW.payment_link := 'https://razorpay.me/@teamneetblade/' || NEW.price::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER auto_generate_payment_link
  BEFORE INSERT OR UPDATE OF price ON materials
  FOR EACH ROW
  EXECUTE FUNCTION generate_payment_link();
```

Or simply run the SQL file: `/app/SUPABASE_MATERIALS_UPDATE.sql`

### Storage Bucket Setup
Ensure your Supabase storage bucket "materials" allows:
1. File uploads in root (for materials)
2. File uploads in `thumbnails/` folder (for thumbnail images)
3. Public access for reading files

## How to Use - Step by Step

### For Admins: Uploading Materials

1. **Navigate to Admin Panel**
   - Go to `/admin`
   - Login with admin credentials
   - Click "Materials" tab
   - Click "Upload Material" button

2. **Fill in Material Details**
   - **Title** (required): e.g., "Mechanics - Laws of Motion"
   - **Subject** (required): Select Physics/Chemistry/Biology
   - **Description** (optional): Brief description of the material
   - **Price** (required): Enter price in rupees, e.g., 299
     - Preview of payment link shows: `https://razorpay.me/@teamneetblade/299`
   - **Thumbnail** (optional): Upload a preview image (JPG, PNG, max 5MB)
   - **Material File** (required): Upload the actual PDF/video file (max 50MB)

3. **Upload and Verify**
   - Click "Upload" button
   - Wait for success message
   - Material appears in the table with all details

### For Admins: Managing Materials

#### View Materials Table
The materials table shows:
- **Thumbnail**: Preview image or default icon
- **Title & Description**: Material name and details
- **Subject**: Badge showing subject (Physics/Chemistry/Biology)
- **Price**: Displayed in green with ₹ symbol
- **Size**: File size in MB/KB
- **Upload Date**: When material was added
- **Payment Link**: 
  - Copy button (📋) - Copies link to clipboard
  - Open button (🔗) - Opens payment page in new tab
- **Actions**:
  - View button - Opens the material file
  - Delete button - Removes the material

#### Share Payment Links
1. Click the **Copy button** (📋) next to payment link
2. Share the link with students via:
   - WhatsApp
   - Email
   - SMS
   - Website/social media
3. Students click the link and make payment
4. Check Razorpay dashboard for payment confirmations
5. Manually grant access to the material after payment verification

### For Students: Purchasing Materials

1. **Receive Payment Link**
   - Get link from admin/teacher
   - Format: `https://razorpay.me/@teamneetblade/299`

2. **Click Payment Link**
   - Opens Razorpay payment page
   - Amount is pre-filled (e.g., ₹299)

3. **Choose Payment Method**
   - Credit/Debit Card
   - UPI (Google Pay, PhonePe, Paytm)
   - Net Banking
   - Wallets

4. **Complete Payment**
   - Enter payment details
   - Confirm transaction
   - Receive payment confirmation

5. **Get Material Access**
   - Admin verifies payment in Razorpay dashboard
   - Admin sends material download link via email
   - Student downloads and accesses the material

## Example Workflow

### Example 1: Physics Study Material

**Admin Side:**
```
1. Title: "Mechanics - Newton's Laws"
2. Subject: Physics
3. Description: "Complete notes on Newton's three laws with examples"
4. Price: ₹299
5. Thumbnail: Upload physics_cover.jpg
6. File: Upload mechanics_notes.pdf
7. Click Upload
✅ Payment link generated: razorpay.me/@teamneetblade/299
```

**Student Side:**
```
1. Receives WhatsApp message with payment link
2. Clicks: razorpay.me/@teamneetblade/299
3. Chooses UPI payment (Google Pay)
4. Pays ₹299
5. Receives confirmation
6. Admin emails mechanics_notes.pdf
7. Student downloads and studies
```

### Example 2: Chemistry Video Lecture

**Admin Side:**
```
1. Title: "Organic Chemistry - Reactions"
2. Subject: Chemistry
3. Price: ₹499
4. Thumbnail: Upload chem_thumb.jpg
5. File: Upload organic_reactions.mp4
✅ Payment link: razorpay.me/@teamneetblade/499
```

## Payment Link Features

### Auto-Generation
- Payment links are automatically generated when you enter a price
- Format: `https://razorpay.me/@teamneetblade/{price}`
- Example: ₹299 → `razorpay.me/@teamneetblade/299`

### Quick Actions
- **Copy Button**: One-click copy to clipboard with toast notification
- **Open Button**: Test payment flow by opening link in new tab
- **Payment Link Preview**: Shows in upload modal before saving

### Payment Link Structure
```
Base URL: https://razorpay.me/@teamneetblade
With Price: /299
Full Link: https://razorpay.me/@teamneetblade/299
```

## Technical Details

### Files Modified
1. `/app/client/src/pages/AdminMaterialUploadModal.tsx`
   - Added price input field
   - Added thumbnail upload field
   - Auto-generate payment link logic
   - Enhanced validation

2. `/app/client/src/pages/Admin.tsx`
   - Updated materials table with new columns
   - Added thumbnail display
   - Added price display
   - Added payment link copy/open buttons

3. Database Schema
   - Added `price` column (DECIMAL)
   - Added `thumbnail_url` column (TEXT)
   - Added `payment_link` column (TEXT)
   - Added trigger for auto-generation

### Storage Structure
```
Supabase Storage: materials/
├── [timestamp]_[random].pdf         (Main files)
├── [timestamp]_[random].mp4
└── thumbnails/
    ├── thumb_[timestamp]_[random].jpg
    └── thumb_[timestamp]_[random].png
```

### Data Flow
```
Admin Upload
    ↓
Upload Main File → Supabase Storage
    ↓
Upload Thumbnail (optional) → Supabase Storage/thumbnails/
    ↓
Generate Payment Link (price-based)
    ↓
Insert to Database with all fields
    ↓
Display in Materials Table
    ↓
Admin Shares Payment Link
    ↓
Student Makes Payment via Razorpay
    ↓
Admin Verifies in Razorpay Dashboard
    ↓
Admin Grants Material Access
```

## Important Notes

### Pricing
- All prices are in Indian Rupees (₹)
- Minimum: ₹1
- Decimals allowed (e.g., ₹299.99)
- Payment link rounds to 2 decimal places

### Thumbnails
- Optional but recommended for better user experience
- Supported formats: JPG, PNG, GIF, WEBP
- Maximum size: 5MB
- Aspect ratio: Square (1:1) recommended for best display

### Payment Links
- Generated automatically based on price
- Can be copied and shared immediately
- Link format cannot be manually edited (auto-generated)
- Links direct to Razorpay payment page

### File Sizes
- Study materials: Max 50MB
- Thumbnails: Max 5MB
- Supported formats: PDF, DOC, DOCX, PPT, PPTX, MP4, AVI, MOV, MKV

## Common Issues & Solutions

### Issue: "Price is required" error
**Solution**: Enter a valid price greater than 0 before uploading

### Issue: Thumbnail not showing
**Solution**: 
- Check file size (must be under 5MB)
- Ensure image format is supported
- Verify Supabase storage permissions

### Issue: Payment link not working
**Solution**:
- Verify Razorpay account is active
- Check if price is correctly set
- Ensure link format is: `razorpay.me/@teamneetblade/{amount}`

### Issue: Database columns missing
**Solution**: Run the SQL migration script in Supabase SQL Editor

## Future Enhancements (Optional)

Potential features to add:
- [ ] Bulk material upload
- [ ] Edit material details after upload
- [ ] Automatic email to students after payment
- [ ] Payment webhook integration for auto-access
- [ ] Material preview for students before purchase
- [ ] Discount codes and promotional pricing
- [ ] Bundle pricing (multiple materials)
- [ ] Subscription-based access
- [ ] Material ratings and reviews
- [ ] Download tracking
- [ ] Revenue analytics dashboard

## Security Considerations

1. **Payment Processing**: All payments handled by Razorpay (PCI-DSS compliant)
2. **File Access**: Files stored in Supabase with public read access
3. **Admin Authentication**: Required for upload and management
4. **Price Validation**: Frontend and backend validation to prevent invalid prices
5. **File Size Limits**: Enforced to prevent abuse

## Support & Troubleshooting

### For Razorpay Issues:
- Visit: https://razorpay.com/support
- Check dashboard: https://dashboard.razorpay.com
- Contact: support@razorpay.com

### For Supabase Issues:
- Check project dashboard
- Review storage bucket permissions
- Verify table schema

### For Application Issues:
- Check browser console for errors
- Verify Supabase credentials in `.env`
- Ensure all migrations are run
- Test with small files first

## Testing Checklist

Before going live, test:
- [ ] Upload material with all fields filled
- [ ] Upload material without thumbnail
- [ ] Test different price values (₹1, ₹299.99, ₹1000)
- [ ] Copy payment link and verify format
- [ ] Open payment link in incognito mode
- [ ] Make test payment on Razorpay
- [ ] Verify material appears correctly in table
- [ ] Test delete functionality
- [ ] Check thumbnail display
- [ ] Verify price display
- [ ] Test payment link copy button

---

**Last Updated:** August 2025
**Version:** 2.0
**System:** NEET Blade Admin Panel

For questions or support, contact the development team.
