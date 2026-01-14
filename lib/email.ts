/**
 * Email utilities for sending booking confirmations
 */

import nodemailer from "nodemailer"
import { format } from "date-fns"

interface BookingConfirmationEmailData {
  guestName: string
  guestEmail: string
  confirmationCode: string
  cabinName: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  pricing: {
    nightlyRate: number
    subtotal: number
    cleaningFee: number
    tax: number
    channelFee: number
    total: number
    currency: string
  }
}

/**
 * Get Gmail transporter (reusable)
 */
function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials not configured")
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

/**
 * Get cabin address based on cabin name
 */
function getCabinAddress(cabinName: string): string {
  const cabinLower = cabinName.toLowerCase()
  if (cabinLower.includes("moss")) {
    return "50 Snowhill Rd, Coldspring TX, 77331"
  } else if (cabinLower.includes("mist")) {
    return "100 Snowhill Rd, Coldspring TX, 77331"
  } else if (cabinLower.includes("sol")) {
    return "150 Snowhill Rd, Coldspring TX, 77331"
  } else if (cabinLower.includes("dew")) {
    return "200 Snowhill Rd, Coldspring TX, 77331"
  }
  // Default address
  return "50 Snowhill Rd, Coldspring TX, 77331"
}

/**
 * Generate HTML email template for booking confirmation
 */
function generateBookingConfirmationEmail(data: BookingConfirmationEmailData): string {
  const { guestName, confirmationCode, cabinName, checkIn, checkOut, nights, guests, pricing } = data
  
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const formattedCheckIn = format(checkInDate, "EEEE, MMMM d, yyyy")
  const formattedCheckOut = format(checkOutDate, "EEEE, MMMM d, yyyy")
  const checkInTime = "4:00 PM"
  const checkOutTime = "11:00 AM"
  const cabinAddress = getCabinAddress(cabinName)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - Luminary Resorts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #2C2E21;
      background-color: #F5F5F0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
    }
    
    .header {
      background: linear-gradient(135deg, #2C2E21 0%, #3A3D2F 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo {
      font-family: 'Quicksand', sans-serif;
      font-size: 28px;
      font-weight: 500;
      letter-spacing: 0.15em;
      color: #F5F5F0;
      margin-bottom: 8px;
    }
    
    .tagline {
      font-family: 'Dancing Script', cursive;
      font-size: 18px;
      color: rgba(245, 245, 240, 0.9);
      font-style: italic;
      margin-top: 8px;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .confirmation-badge {
      background-color: #E8F5E9;
      border-left: 4px solid #4CAF50;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .confirmation-badge h1 {
      font-size: 24px;
      font-weight: 600;
      color: #2C2E21;
      margin-bottom: 8px;
    }
    
    .confirmation-code {
      font-family: 'Courier New', monospace;
      font-size: 20px;
      font-weight: 700;
      color: #2C2E21;
      letter-spacing: 2px;
      margin-top: 10px;
    }
    
    .greeting {
      font-size: 16px;
      color: #2C2E21;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #2C2E21;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #E0E0E0;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 15px 0;
      border-bottom: 1px solid #E0E0E0;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-size: 14px;
      color: #666;
      font-weight: 400;
      flex: 0 0 auto;
    }
    
    .info-value {
      font-size: 14px;
      color: #2C2E21;
      font-weight: 500;
      text-align: right;
      flex: 1;
      margin-left: 20px;
    }
    
    .pricing-section {
      background-color: #FAFAFA;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    
    .pricing-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #E0E0E0;
    }
    
    .pricing-row:last-of-type:not(.pricing-total) {
      border-bottom: none;
    }
    
    .pricing-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0 0 0;
      margin-top: 20px;
      border-top: 2px solid #2C2E21;
      font-size: 20px;
      font-weight: 700;
      color: #2C2E21;
    }
    
    .instructions {
      background-color: #FFF9E6;
      border-left: 4px solid #FFC107;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    
    .instructions h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2C2E21;
      margin-bottom: 12px;
    }
    
    .instructions ul {
      list-style: none;
      padding-left: 0;
    }
    
    .instructions li {
      padding: 6px 0;
      padding-left: 24px;
      position: relative;
      font-size: 14px;
      color: #2C2E21;
      line-height: 1.6;
    }
    
    .instructions li:before {
      content: "•";
      position: absolute;
      left: 8px;
      color: #2C2E21;
      font-weight: bold;
    }
    
    .footer {
      background-color: #2C2E21;
      color: #F5F5F0;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    
    .footer a {
      color: #F5F5F0;
      text-decoration: underline;
    }
    
    .footer-contact {
      margin-top: 15px;
      line-height: 1.8;
    }
    
    .divider {
      height: 1px;
      background-color: #E0E0E0;
      margin: 30px 0;
    }
    
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .logo {
        font-size: 24px;
      }
      
      .confirmation-badge h1 {
        font-size: 20px;
      }
      
      .info-row {
        flex-direction: column;
      }
      
      .info-value {
        text-align: left;
        margin-top: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">LUMINARY RESORTS</div>
      <div class="tagline">Where silence reflects love</div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Confirmation Badge -->
      <div class="confirmation-badge">
        <h1>✓ Booking Confirmed</h1>
        <div class="confirmation-code">${confirmationCode}</div>
      </div>
      
      <!-- Greeting -->
      <div class="greeting">
        <p>Dear ${guestName},</p>
        <p style="margin-top: 12px;">
          Thank you for choosing Luminary Resorts at Hilltop. We're delighted to confirm your reservation and look forward to welcoming you to your peaceful retreat.
        </p>
      </div>
      
      <!-- Booking Details -->
      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="info-row">
          <span class="info-label">Cabin</span>
          <span class="info-value">${cabinName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Check-in</span>
          <span class="info-value">${formattedCheckIn}<br><span style="font-size: 12px; color: #666; font-weight: 400;">${checkInTime}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Check-out</span>
          <span class="info-value">${formattedCheckOut}<br><span style="font-size: 12px; color: #666; font-weight: 400;">${checkOutTime}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Duration</span>
          <span class="info-value">${nights} ${nights === 1 ? 'night' : 'nights'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Guests</span>
          <span class="info-value">${guests} ${guests === 1 ? 'guest' : 'guests'}</span>
        </div>
      </div>
      
      <!-- Pricing -->
      <div class="section">
        <div class="section-title">Price Summary</div>
        <div class="pricing-section">
          <div class="pricing-row">
            <span class="info-label">${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.nightlyRate.toFixed(2)} × ${nights} ${nights === 1 ? 'night' : 'nights'}</span>
            <span class="info-value">${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.subtotal.toFixed(2)}</span>
          </div>
          ${pricing.cleaningFee > 0 ? `
          <div class="pricing-row">
            <span class="info-label">Cleaning Fee</span>
            <span class="info-value">${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.cleaningFee.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="pricing-row">
            <span class="info-label">Lodging Tax</span>
            <span class="info-value">${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.tax.toFixed(2)}</span>
          </div>
          <div class="pricing-row">
            <span class="info-label">Guest Channel Fee</span>
            <span class="info-value">${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.channelFee.toFixed(2)}</span>
          </div>
          <div class="pricing-total">
            <span>Total</span>
            <span>${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <!-- Check-in Instructions -->
      <div class="instructions">
        <h3>What to Expect</h3>
        <ul>
          <li><strong>Self Check-in:</strong> You'll receive detailed arrival instructions and access codes via email 24 hours before your stay.</li>
          <li><strong>Check-in Time:</strong> ${checkInTime} on ${formattedCheckIn}</li>
          <li><strong>Check-out Time:</strong> ${checkOutTime} on ${formattedCheckOut}</li>
          <li><strong>Location:</strong> ${cabinAddress}</li>
          <li><strong>Parking:</strong> Free private parking is available at your cabin.</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #666; line-height: 1.8;">
        If you have any questions or need assistance, please don't hesitate to reach out. We're here to ensure your stay is everything you hope for.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Luminary Resorts at Hilltop</strong></p>
      <div class="footer-contact">
        <p>50 Snowhill Rd, Coldspring TX, 77331</p>
        <p>Phone: <a href="tel:+14045908346">(404) 590-8346</a></p>
        <p>Email: <a href="mailto:lydia@luminaryresorts.com">lydia@luminaryresorts.com</a></p>
        <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
          <a href="https://luminaryresorts.com">Visit our website</a> | 
          <a href="https://luminaryresorts.com/contact">Contact Us</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version of booking confirmation email
 */
function generateBookingConfirmationEmailText(data: BookingConfirmationEmailData): string {
  const { guestName, confirmationCode, cabinName, checkIn, checkOut, nights, guests, pricing } = data
  
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const formattedCheckIn = format(checkInDate, "EEEE, MMMM d, yyyy")
  const formattedCheckOut = format(checkOutDate, "EEEE, MMMM d, yyyy")
  const cabinAddress = getCabinAddress(cabinName)

  return `
LUMINARY RESORTS
Where silence reflects love

✓ BOOKING CONFIRMED

Confirmation Code: ${confirmationCode}

Dear ${guestName},

Thank you for choosing Luminary Resorts at Hilltop. We're delighted to confirm your reservation and look forward to welcoming you to your peaceful retreat.

BOOKING DETAILS
---------------
Cabin: ${cabinName}
Check-in: ${formattedCheckIn} at 4:00 PM
Check-out: ${formattedCheckOut} at 11:00 AM
Duration: ${nights} ${nights === 1 ? 'night' : 'nights'}
Guests: ${guests} ${guests === 1 ? 'guest' : 'guests'}

PRICE SUMMARY
-------------
${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.nightlyRate.toFixed(2)} × ${nights} ${nights === 1 ? 'night' : 'nights'}: ${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.subtotal.toFixed(2)}
${pricing.cleaningFee > 0 ? `Cleaning Fee: ${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.cleaningFee.toFixed(2)}\n` : ''}Lodging Tax: ${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.tax.toFixed(2)}
Guest Channel Fee: ${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.channelFee.toFixed(2)}
─────────────────────────────
Total: ${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.total.toFixed(2)}

WHAT TO EXPECT
--------------
• Self Check-in: You'll receive detailed arrival instructions and access codes via email 24 hours before your stay.
• Check-in Time: 4:00 PM on ${formattedCheckIn}
• Check-out Time: 11:00 AM on ${formattedCheckOut}
• Location: ${cabinAddress}
• Parking: Free private parking is available at your cabin.

If you have any questions or need assistance, please don't hesitate to reach out. We're here to ensure your stay is everything you hope for.

CONTACT INFORMATION
-------------------
Luminary Resorts at Hilltop
50 Snowhill Rd, Coldspring TX, 77331
Phone: (404) 590-8346
Email: lydia@luminaryresorts.com
Website: https://luminaryresorts.com
  `.trim()
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(data: BookingConfirmationEmailData): Promise<void> {
  // Check if email service is configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not configured. Skipping email send.")
    return
  }

  try {
    const transporter = getTransporter()
    
    const subject = `Booking Confirmation - ${data.confirmationCode} - Luminary Resorts`
    
    await transporter.sendMail({
      from: `"Luminary Resorts" <${process.env.GMAIL_USER}>`,
      to: data.guestEmail,
      replyTo: process.env.GMAIL_USER,
      subject,
      html: generateBookingConfirmationEmail(data),
      text: generateBookingConfirmationEmailText(data),
    })
    
    console.log(`Booking confirmation email sent to ${data.guestEmail}`)
  } catch (error) {
    console.error("Error sending booking confirmation email:", error)
    // Don't throw - email failure shouldn't break the booking process
    // But log it for monitoring
  }
}
