/**
 * Email template for sending influencer commission reports
 */

import { getTransporter } from "@/lib/email"
import type { ReportBooking, ReportSummary } from "@/lib/reports"

interface SendInfluencerReportEmailParams {
  influencerEmail: string
  influencerName: string
  reportData: {
    startDate: string
    endDate: string
    bookings: ReportBooking[]
    summary: ReportSummary
  }
  csvAttachment: Buffer
  emailSubject?: string
  emailMessage?: string
}

/**
 * Generate HTML email template for influencer report
 */
function generateReportEmailHTML(params: SendInfluencerReportEmailParams): string {
  const { influencerName, reportData, emailMessage } = params
  const { summary } = reportData

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commission Report - Luminary Resorts</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #2C2E21;
      background-color: #F5F5F0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      padding: 40px;
    }
    .header {
      background: linear-gradient(135deg, #2C2E21 0%, #3A3D2F 100%);
      padding: 30px;
      text-align: center;
      color: #F5F5F0;
      margin: -40px -40px 30px -40px;
    }
    .summary {
      background-color: #FAFAFA;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E0E0E0;
    }
    .summary-row:last-child {
      border-bottom: none;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E0E0E0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>LUMINARY RESORTS</h1>
      <p>Commission Report</p>
    </div>
    
    <p>Hi ${influencerName},</p>
    
    ${emailMessage ? `<p>${emailMessage}</p>` : ""}
    
    <p>Attached is your commission report for ${reportData.startDate} to ${reportData.endDate}.</p>
    
    <div class="summary">
      <h3>Summary</h3>
      <div class="summary-row">
        <span>Total Bookings:</span>
        <strong>${summary.total_bookings}</strong>
      </div>
      <div class="summary-row">
        <span>Total Revenue:</span>
        <strong>$${summary.total_revenue.toFixed(2)}</strong>
      </div>
      <div class="summary-row">
        <span>Total Discount Given:</span>
        <strong>$${summary.total_discount_given.toFixed(2)}</strong>
      </div>
      <div class="summary-row">
        <span>Commission Owed:</span>
        <strong>$${summary.total_commission_owed.toFixed(2)}</strong>
      </div>
      <div class="summary-row">
        <span>Commission Paid:</span>
        <strong>$${summary.total_commission_paid.toFixed(2)}</strong>
      </div>
      <div class="summary-row">
        <span>Outstanding:</span>
        <strong>$${(summary.total_commission_owed - summary.total_commission_paid).toFixed(2)}</strong>
      </div>
    </div>
    
    <p>Please see the attached CSV file for detailed booking information.</p>
    
    <p>If you have any questions, please don't hesitate to reach out.</p>
    
    <div class="footer">
      <p>Best regards,<br>Luminary Resorts Team</p>
      <p>50 Snowhill Rd, Coldspring TX, 77331<br>
      Email: lydia@luminaryresorts.com</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Send influencer report email
 */
export async function sendInfluencerReportEmail(
  params: SendInfluencerReportEmailParams
): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials not configured")
  }

  const transporter = getTransporter()

  const subject =
    params.emailSubject ||
    `Your Luminary Resorts Commission Report - ${new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`

  await transporter.sendMail({
    from: `"Luminary Resorts" <${process.env.GMAIL_USER}>`,
    to: params.influencerEmail,
    replyTo: process.env.GMAIL_USER,
    subject,
    html: generateReportEmailHTML(params),
    text: `Hi ${params.influencerName},\n\nAttached is your commission report.\n\nSummary:\n- Total Bookings: ${params.reportData.summary.total_bookings}\n- Total Revenue: $${params.reportData.summary.total_revenue.toFixed(2)}\n- Commission Owed: $${params.reportData.summary.total_commission_owed.toFixed(2)}\n- Commission Paid: $${params.reportData.summary.total_commission_paid.toFixed(2)}\n\nPlease see the attached CSV file for details.`,
    attachments: [
      {
        filename: `commission-report-${new Date().toISOString().split("T")[0]}.csv`,
        content: params.csvAttachment,
      },
    ],
  })

  console.log(`Influencer report email sent to ${params.influencerEmail}`)
}
