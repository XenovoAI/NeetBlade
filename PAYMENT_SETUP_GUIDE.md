# Razorpay Payment Setup Guide

## Overview
The admin panel now includes a **Payments** tab that allows you to generate Razorpay payment links for receiving payments.

## Features Added

### 1. **Payment Management Tab in Admin Panel**
   - New "Payments" tab added to the admin dashboard
   - Located at: `/admin` → Payments tab

### 2. **Generate Payment Links**
   - Enter custom amount in rupees (₹)
   - Automatically generates Razorpay payment link
   - Format: `https://razorpay.me/@teamneetblade/{amount}`

### 3. **Payment Link Features**
   - Copy link to clipboard (one-click copy button)
   - Open link in new tab to test
   - Visual feedback with toast notifications
   - Amount validation (ensures positive numbers)

## How to Use

### Step 1: Access Admin Panel
1. Navigate to `/admin/login`
2. Login with admin credentials (teamneetblade@gmail.com)
3. Go to the **Payments** tab

### Step 2: Generate Payment Link
1. Enter the amount you want to charge (e.g., 500 for ₹500)
2. Click "Generate Link"
3. The payment link will be displayed below

### Step 3: Share Payment Link
1. Click the **Copy** button to copy the link
2. Share the link with your customers via:
   - WhatsApp
   - Email
   - SMS
   - Social media
   - Website

### Step 4: Customer Makes Payment
1. Customer clicks on the link
2. Redirected to Razorpay payment page
3. Customer completes payment using:
   - Credit/Debit cards
   - UPI
   - Net Banking
   - Wallets

## Payment Link Format

**Base Link:** `https://razorpay.me/@teamneetblade`

**With Amount:** `https://razorpay.me/@teamneetblade/500` (for ₹500)

## Example Use Cases

### 1. **Study Material Sales**
   - Generate link for ₹299
   - Share with students purchasing PDF materials

### 2. **Live Test Access**
   - Generate link for ₹199
   - Share with students buying test access

### 3. **Custom Amount**
   - Enter any amount based on your pricing
   - Perfect for bundle deals or special offers

## UI Components Added

### Admin Panel Updates:
- **IndianRupee Icon** - Visual indicator for payment section
- **Amount Input Field** - Accepts decimal values
- **Generate Button** - Creates payment link
- **Copy Button** - Quick clipboard copy
- **External Link Button** - Test payment flow
- **Info Cards** - Shows account details and instructions

## Technical Details

### Frontend Changes:
- Updated `/app/client/src/pages/Admin.tsx`
- Added payment state management
- Integrated toast notifications
- Added new "Payments" tab to admin navigation

### Payment Flow:
1. Admin enters amount
2. System generates Razorpay link with amount
3. Link format: `{base_url}/{amount}`
4. Customer clicks link → Razorpay handles payment
5. Payment confirmation goes to Razorpay dashboard

## Important Notes

1. **Razorpay Account**: Payments go to @teamneetblade account
2. **Test Mode**: Use test amounts (₹1-10) for testing
3. **Transaction Fees**: Razorpay charges ~2% transaction fees
4. **Payment Confirmation**: Check Razorpay dashboard for payment status
5. **Refunds**: Process refunds through Razorpay dashboard

## Future Enhancements (Optional)

If you want to extend this further, you can:
- Track payment history in Supabase
- Send automatic email receipts
- Create product-specific payment links
- Add webhook integration for automatic order fulfillment
- Display payment history in admin panel

## Support

For Razorpay-related issues:
- Visit: https://razorpay.com/support
- Check Razorpay dashboard for transaction details
- Contact Razorpay support for payment disputes

## Security

- Payment processing handled entirely by Razorpay
- No sensitive payment data stored in your application
- PCI-DSS compliant payment gateway
- Secure HTTPS links

---

**Last Updated:** August 2025
**Version:** 1.0
