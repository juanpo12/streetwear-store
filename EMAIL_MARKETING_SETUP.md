# Email Marketing Setup Guide

## Overview
The admin settings now include a complete email marketing system that allows you to send newsletters and promotional emails to your subscribers.

## Features

### 📧 Email Campaign Creation
- **Subject Line**: Create compelling email subjects
- **Rich Content**: Write detailed email content with formatting
- **Preview Mode**: Preview emails before sending
- **Send to All or Selected**: Choose specific subscribers or send to everyone

### 👥 Subscriber Management
- **View All Subscribers**: See complete list of email subscribers
- **Select Recipients**: Choose specific subscribers for targeted campaigns
- **Export Data**: Download subscriber lists for external use
- **Subscriber Stats**: Track subscription dates and status

### ⚙️ General Settings
- **Store Configuration**: Update store name, email, and description
- **Email Templates**: Customize email appearance (coming soon)

## API Integration Required

To make this fully functional, you'll need to connect the following endpoints:

### 1. Get Subscribers
\`\`\`javascript
// GET /api/subscribers
// Returns array of subscriber objects
{
  id: number,
  email: string,
  name: string,
  subscribed: string,
  status: 'active' | 'inactive'
}
\`\`\`

### 2. Send Email Campaign
\`\`\`javascript
// POST /api/email/send
{
  subject: string,
  content: string,
  recipients: number[] | 'all'
}
\`\`\`

### 3. Update Store Settings
\`\`\`javascript
// PUT /api/settings
{
  storeName: string,
  storeEmail: string,
  storeDescription: string
}
\`\`\`

## Database Schema

### Subscribers Table
\`\`\`sql
CREATE TABLE subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Email Campaigns Table (Optional)
\`\`\`sql
CREATE TABLE email_campaigns (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recipients_count INTEGER,
  created_by INTEGER REFERENCES users(id)
);
\`\`\`

## Email Service Integration

You can integrate with services like:
- **Resend** (recommended for Next.js)
- **SendGrid**
- **Mailgun**
- **AWS SES**

### Example with Resend:
\`\`\`javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCampaign(subject, content, recipients) {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: recipients,
    subject: subject,
    html: content,
  });
}
\`\`\`

## Current Status
✅ UI Components Complete
✅ State Management Ready
✅ Preview Functionality
⏳ API Integration Needed
⏳ Email Service Setup Required

## Next Steps
1. Set up your preferred email service
2. Create the API endpoints listed above
3. Connect your subscriber database
4. Test with a small group first
5. Launch your email marketing campaigns!
