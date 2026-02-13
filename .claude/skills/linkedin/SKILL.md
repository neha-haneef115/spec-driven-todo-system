---
name: linkedin
description: LinkedIn automation skill for business content management. Handles drafting posts about your business, scheduling posts, monitoring engagement, and provides safe posting with preview and approval workflow. Uses Playwright for LinkedIn web automation with secure credential management.
---

# LinkedIn Automation Skill

This skill provides comprehensive LinkedIn automation capabilities for business content management, including post drafting, scheduling, engagement monitoring, and safe posting workflows with approval mechanisms. Built with Playwright for reliable web automation and secure credential management.

## When to Use This Skill

Use this skill when working with:
- LinkedIn content creation and posting
- Business post drafting and scheduling
- Engagement monitoring and analytics
- Safe posting workflows with approval
- LinkedIn profile management
- Content strategy automation
- Professional networking automation

## Prerequisites

- LinkedIn account with appropriate permissions
- Node.js environment for Playwright
- Understanding of LinkedIn's terms of service
- Business content strategy guidelines
- Secure credential storage setup

## Core Concepts

This skill provides LinkedIn automation through three main components:

1. **Content Management**: Draft, edit, and schedule LinkedIn posts about your business
2. **Safe Posting**: Preview and approval workflow before posting
3. **Engagement Monitoring**: Track likes, comments, and shares on posted content

The skill uses Playwright for browser automation to interact with LinkedIn's web interface, ensuring reliable operation while respecting LinkedIn's automation policies. All credentials are securely stored and managed.

## Getting Started

### Installation

Install required dependencies:
```bash
npm install playwright dotenv
npx playwright install
```

### Credential Setup

Create a `.env` file with your LinkedIn credentials:
```env
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password
LINKEDIN_2FA_SECRET=your_2fa_secret  # Optional, for 2FA
```

**IMPORTANT**: Never commit credentials to version control. The `.env` file should be in `.gitignore`.

### Basic Usage

```javascript
import { LinkedInAutomation } from './scripts/linkedin-automation.js';

const linkedin = new LinkedInAutomation();

// Draft a post
await linkedin.draftPost({
  content: "Excited to share our latest business milestone!",
  hashtags: ["#business", "#milestone", "#success"],
  media: [], // Optional: paths to images/videos
  scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
});

// Preview and approve post
const preview = await linkedin.previewPost(postId);
console.log(preview);

// Post with approval
await linkedin.postWithApproval(postId);
```

## Post Management

### Drafting Posts

Create business posts with rich content:

```javascript
const post = await linkedin.draftPost({
  title: "Company Milestone Achievement",
  content: "We're thrilled to announce that our team has achieved a significant milestone in our journey!",
  hashtags: ["#milestone", "#achievement", "#business"],
  media: [
    "./assets/celebration-image.jpg",
    "./assets/team-photo.jpg"
  ],
  scheduledTime: new Date("2024-02-15T10:00:00Z"),
  targetAudience: "professionals",
  tone: "professional-celebratory"
});
```

### Scheduling Posts

Schedule posts for optimal engagement times:

```javascript
const scheduledPost = await linkedin.schedulePost({
  content: "Join us for our upcoming webinar on business automation!",
  scheduledTime: new Date("2024-02-20T14:00:00Z"),
  timezone: "America/New_York",
  reminderSettings: {
    email: true,
    notification: true,
    reminderTime: 30 // minutes before
  }
});
```

### Content Templates

Use pre-defined templates for consistent branding:

```javascript
const templatePost = await linkedin.createFromTemplate({
  templateName: "business-milestone",
  variables: {
    achievement: "Reached 1000 customers",
    date: "February 2024",
    teamSize: "25 team members"
  }
});
```

## Safe Posting Workflow

### Preview System

Preview posts before publishing:

```javascript
const preview = await linkedin.previewPost(postId);
console.log(`
Post Preview:
Title: ${preview.title}
Content: ${preview.content}
Hashtags: ${preview.hashtags.join(', ')}
Media: ${preview.media.length} files
Scheduled: ${preview.scheduledTime}
`);
```

### Approval Process

Implement multi-level approval:

```javascript
// Require approval for posts
const approvalSettings = {
  requirePreview: true,
  approvalTimeout: 24 * 60 * 60 * 1000, // 24 hours
  approvers: ["manager@company.com", "marketing@company.com"],
  autoApprove: false
};

const approval = await linkedin.requestApproval(postId, approvalSettings);
```

### Posting with Safety Checks

```javascript
const postResult = await linkedin.safePost({
  postId: postId,
  checks: {
    contentLength: true,
    hashtagLimit: true,
    mediaValidation: true,
    businessHours: true,
    duplicateCheck: true
  },
  onApproval: (post) => {
    console.log(`Post approved: ${post.id}`);
  },
  onRejection: (reason) => {
    console.log(`Post rejected: ${reason}`);
  }
});
```

## Engagement Monitoring

### Tracking Performance

Monitor post engagement metrics:

```javascript
const metrics = await linkedin.getPostMetrics(postId);
console.log(`
Engagement Metrics:
Views: ${metrics.views}
Likes: ${metrics.likes}
Comments: ${metrics.comments}
Shares: ${metrics.shares}
Engagement Rate: ${metrics.engagementRate}%
`);
```

### Automated Responses

Set up automated engagement responses:

```javascript
const responseRules = {
  newFollowers: {
    autoThank: true,
    message: "Thanks for connecting! Looking forward to networking with you."
  },
  comments: {
    autoReply: false,
    keywords: ["question", "how", "what"],
    response: "Great question! Let me address that for you."
  }
};

await linkedin.setEngagementRules(responseRules);
```

### Analytics Dashboard

Generate engagement reports:

```javascript
const report = await linkedin.generateReport({
  period: "last-30-days",
  metrics: ["engagement", "reach", "growth"],
  format: "pdf"
});
```

## Security and Privacy

### Credential Management

Secure credential storage and rotation:

```javascript
// Store credentials securely
await linkedin.storeCredentials({
  email: process.env.LINKEDIN_EMAIL,
  password: process.env.LINKEDIN_PASSWORD,
  twoFactorSecret: process.env.LINKEDIN_2FA_SECRET
});

// Rotate credentials
await linkedin.rotateCredentials();
```

### Privacy Controls

Implement privacy safeguards:

```javascript
const privacySettings = {
  dataRetention: 90, // days
  anonymizeMetrics: true,
  shareAnalytics: false,
  complianceMode: "GDPR"
};

await linkedin.setPrivacySettings(privacySettings);
```

## Advanced Features

### Content Optimization

AI-powered content suggestions:

```javascript
const suggestions = await linkedin.optimizeContent({
  content: draftContent,
  targetAudience: "tech-professionals",
  goals: ["engagement", "reach", "leads"],
  tone: "professional"
});
```

### A/B Testing

Test different post variations:

```javascript
const test = await linkedin.createABTest({
  variants: [
    { content: "Version A content", hashtags: ["#tech", "#innovation"] },
    { content: "Version B content", hashtags: ["#business", "#growth"] }
  ],
  testDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  successMetric: "engagement"
});
```

### Integration with Business Systems

Connect with CRM and marketing tools:

```javascript
// Sync with CRM
await linkedin.syncWithCRM({
  crmProvider: "salesforce",
  leadGeneration: true,
  trackingCodes: true
});

// Marketing automation
await linkedin.connectMarketingTools({
  emailPlatform: "mailchimp",
  analytics: "google-analytics",
  socialCalendar: "hootsuite"
});
```

## Troubleshooting

### Common Issues

For troubleshooting tips and common solutions, see [scripts/troubleshooting.md](scripts/troubleshooting.md).

### Debug Mode

Enable detailed logging:

```javascript
const linkedin = new LinkedInAutomation({
  debug: true,
  logLevel: "verbose",
  screenshotOnError: true
});
```

## Best Practices

### Content Guidelines

- Follow LinkedIn's content policies
- Maintain professional tone
- Use relevant hashtags strategically
- Include high-quality media when appropriate
- Engage with comments promptly

### Automation Ethics

- Respect LinkedIn's terms of service
- Don't spam or over-automate
- Maintain authentic engagement
- Monitor for policy changes
- Use automation to enhance, not replace, human interaction

### Security Best Practices

- Regular credential rotation
- Monitor for unauthorized access
- Use secure connections (HTTPS)
- Implement rate limiting
- Log all automated activities

## Scripts and Utilities

### Available Scripts

- [scripts/linkedin-automation.js](scripts/linkedin-automation.js) - Main automation class
- [scripts/content-manager.js](scripts/content-manager.js) - Content creation and management
- [scripts/scheduler.js](scripts/scheduler.js) - Post scheduling functionality
- [scripts/analytics.js](scripts/analytics.js) - Engagement monitoring and reporting
- [scripts/security.js](scripts/security.js) - Credential and privacy management

### Running Scripts

```bash
# Start automation
node scripts/linkedin-automation.js

# Content management
node scripts/content-manager.js --action draft --template business-milestone

# Schedule posts
node scripts/scheduler.js --date "2024-02-15" --time "10:00"

# Generate reports
node scripts/analytics.js --report engagement --period 30days
```

## Compliance and Legal

### LinkedIn Terms of Service

This skill is designed to comply with LinkedIn's terms of service and automation policies. Users are responsible for:

- Maintaining compliance with LinkedIn's policies
- Respecting rate limits and usage guidelines
- Ensuring content meets community standards
- Monitoring for policy updates

### Business Compliance

- GDPR compliance for data handling
- CAN-SPAM compliance for marketing content
- Industry-specific regulations
- Corporate social media policies

## Support and Maintenance

### Regular Maintenance

- Update Playwright browsers monthly
- Review and rotate credentials quarterly
- Monitor LinkedIn API changes
- Update content templates regularly
- Audit security settings

### Getting Help

For additional support:
- Check [scripts/troubleshooting.md](scripts/troubleshooting.md)
- Review LinkedIn's developer documentation
- Monitor automation logs for issues
- Join the community forums for best practices
