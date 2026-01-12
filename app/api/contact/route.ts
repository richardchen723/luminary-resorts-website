import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:5',message:'API route called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  try {
    const body = await request.json()
    const { name, email, inquiryType, message } = body

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:9',message:'Request body parsed',data:{name:name||'missing',email:email||'missing',inquiryType:inquiryType||'missing',messageLength:message?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Validate required fields
    if (!name || !email || !message) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:15',message:'Validation failed',data:{hasName:!!name,hasEmail:!!email,hasMessage:!!message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    // Check if Gmail credentials are configured
    const hasGmailUser = !!process.env.GMAIL_USER
    const hasGmailPassword = !!process.env.GMAIL_APP_PASSWORD
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:25',message:'Gmail credentials check',data:{hasGmailUser,hasGmailPassword,gmailUserLength:process.env.GMAIL_USER?.length||0,gmailPasswordLength:process.env.GMAIL_APP_PASSWORD?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!hasGmailUser || !hasGmailPassword) {
      console.error("Gmail credentials not configured")
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:28',message:'Gmail credentials missing - returning error',data:{hasGmailUser,hasGmailPassword},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: "Email service not configured. Please contact support directly." },
        { status: 500 }
      )
    }

    // Create Gmail transporter
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:31',message:'Creating transporter',data:{gmailUser:process.env.GMAIL_USER?.substring(0,5)+'...'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Email recipients
    const recipients = ["lydia@luminaryresorts.com", "usman@luminaryresorts.com"]
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:40',message:'Recipients configured',data:{recipients,recipientCount:recipients.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Email content
    const subject = `New ${inquiryType} inquiry from ${name}`
    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This email was sent from the Luminary Resorts contact form.</p>
    `

    // Send email to all recipients
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:55',message:'Starting email send',data:{recipientCount:recipients.length,subject},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const emailPromises = recipients.map((recipient, index) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:58',message:'Sending email to recipient',data:{recipient,index,from:process.env.GMAIL_USER?.substring(0,5)+'...'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return transporter.sendMail({
        from: `"Luminary Resorts Contact Form" <${process.env.GMAIL_USER}>`,
        to: recipient,
        replyTo: email, // Allow replying directly to the sender
        subject,
        html: htmlContent,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Inquiry Type: ${inquiryType}

Message:
${message}

---
This email was sent from the Luminary Resorts contact form.
        `.trim(),
      }).then((result) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:75',message:'Email sent successfully',data:{recipient,messageId:result.messageId,accepted:result.accepted,rejected:result.rejected,response:result.response?.substring(0,100),pending:result.pending},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return result
      }).catch((error) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:79',message:'Email send failed',data:{recipient,error:error.message,errorCode:error.code,errorStack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw error
      })
    })

    const results = await Promise.all(emailPromises)
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:86',message:'All emails sent',data:{resultCount:results.length,allMessageIds:results.map(r=>r.messageId)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:90',message:'Returning success response',data:{status:200},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      { message: "Your message has been sent successfully. We'll get back to you soon!" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error sending email:", error)
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/contact/route.ts:96',message:'Error caught in catch block',data:{errorMessage:error?.message,errorCode:error?.code,errorStack:error?.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    )
  }
}
