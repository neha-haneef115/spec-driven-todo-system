# LinkedIn Automation Skill

Comprehensive LinkedIn automation skill for business content management, including post drafting, scheduling, engagement monitoring, and safe posting workflows with approval mechanisms.

## Features

- **Content Management**: Draft, edit, and schedule LinkedIn posts about your business
- **Safe Posting**: Preview and approval workflow before posting
- **Engagement Monitoring**: Track likes, comments, and shares on posted content
- **Scheduling**: Advanced scheduling with optimization and recurring posts
- **Templates**: Pre-built templates for consistent business content
- **Analytics**: Performance tracking and optimization recommendations

## Quick Start

### Installation

```bash
npm install playwright dotenv
npx playwright install
```

### Setup

1. Create a `.env` file with your LinkedIn credentials:
```env
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password
LINKEDIN_2FA_SECRET=your_2fa_secret  # Optional
```

2. Initialize the automation:
```javascript
import { LinkedInAutomation } from './scripts/linkedin-automation.js';
import { ContentManager } from './scripts/content-manager.js';
import { PostScheduler } from './scripts/scheduler.js';

const linkedin = new LinkedInAutomation();
await linkedin.initialize();

const contentManager = new ContentManager(linkedin);
const scheduler = new PostScheduler(linkedin, contentManager);
```

### Basic Usage

```javascript
// Draft a post using a template
const post = await contentManager.createFromTemplate('business-milestone', {
  achievement: 'Reached 1000 customers',
  highlight1: '30% growth in Q4',
  highlight2: 'Expanded to 5 new markets',
  highlight3: 'Launched 3 new products'
});

// Preview before posting
const preview = await linkedin.previewPost(post.id);

// Schedule for optimal time
const scheduled = await scheduler.schedulePost({
  content: post.content,
  scheduledTime: new Date('2024-02-15T10:00:00Z')
}, { optimization: true });
```

## Available Scripts

### Core Scripts

- **`linkedin-automation.js`** - Main automation class with LinkedIn interaction
- **`content-manager.js`** - Content creation and template management
- **`scheduler.js`** - Advanced scheduling and optimization

### Usage Examples

```bash
# Run content manager
node scripts/content-manager.js

# Schedule posts
node scripts/scheduler.js --date "2024-02-15" --time "10:00"

# Generate analytics
node scripts/analytics.js --report engagement --period 30days
```

## Templates

### Available Templates

1. **Business Milestone** - Celebrate company achievements
2. **Product Launch** - Announce new products or features
3. **Team Growth** - Share hiring and team expansion news
4. **Industry Insight** - Share industry trends and analysis

### Using Templates

```javascript
// Create from template
const post = await contentManager.createFromTemplate('business-milestone', {
  achievement: 'Your achievement text',
  highlight1: 'First highlight',
  highlight2: 'Second highlight',
  highlight3: 'Third highlight'
});
```

## Scheduling Features

### Time Optimization

The scheduler automatically optimizes posting times based on historical performance data:

```javascript
const optimizedPost = await scheduler.schedulePost({
  content: 'Your post content',
  scheduledTime: new Date('2024-02-15T14:00:00Z')
}, { 
  optimization: true,
  timezone: 'America/New_York'
});
```

### Recurring Posts

```javascript
const recurringPosts = await scheduler.scheduleRecurringPost({
  content: 'Weekly update content'
}, {
  pattern: 'weekly',
  daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
  time: '10:00',
  startDate: '2024-02-01',
  endDate: '2024-03-31'
});
```

## Safety and Compliance

### Approval Workflow

All posts go through a preview and approval process:

```javascript
// Preview post
const preview = await linkedin.previewPost(postId);

// Post with approval
await linkedin.postWithApproval(postId, {
  requirePreview: true,
  approvalTimeout: 24 * 60 * 60 * 1000 // 24 hours
});
```

### Rate Limiting

The automation includes built-in rate limiting to respect LinkedIn's terms of service:

- Maximum 50 posts per day
- Minimum 30 seconds between actions
- Automatic retry logic for failed posts

## Analytics and Reporting

### Performance Tracking

```javascript
// Get post metrics
const metrics = await linkedin.getPostMetrics(postId);

// Generate schedule report
const report = await scheduler.generateScheduleReport(
  '2024-01-01', 
  '2024-01-31'
);
```

### Content Optimization

```javascript
// Optimize content for engagement
const optimization = await contentManager.optimizeContent(
  content,
  'tech-professionals',
  ['engagement', 'reach']
);
```

## Security

### Credential Management

- Secure credential storage with encryption
- Automatic credential rotation
- Two-factor authentication support
- Session management

### Privacy Controls

```javascript
// Set privacy settings
await linkedin.setPrivacySettings({
  dataRetention: 90,
  anonymizeMetrics: true,
  shareAnalytics: false,
  complianceMode: "GDPR"
});
```

## Configuration

### Environment Variables

```env
# LinkedIn Credentials
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password
LINKEDIN_2FA_SECRET=your_2fa_secret

# Security
ENCRYPTION_KEY=your_encryption_key

# Automation Settings
LINKEDIN_HEADLESS=false
LINKEDIN_TIMEOUT=30000
LINKEDIN_DEBUG=false
```

### Brand Guidelines

```javascript
const brandGuidelines = {
  tone: 'professional',
  hashtags: ['#business', '#innovation', '#technology'],
  maxHashtags: 10,
  contentLength: { min: 100, max: 3000 }
};

contentManager.brandGuidelines = brandGuidelines;
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check credentials in `.env`
   - Verify 2FA settings
   - Clear browser cache

2. **Posting Failures**
   - Check content length limits
   - Verify hashtag count
   - Review media file sizes

3. **Scheduling Issues**
   - Validate scheduled times
   - Check timezone settings
   - Review retry configuration

### Debug Mode

Enable detailed logging:

```javascript
const linkedin = new LinkedInAutomation({
  debug: true,
  logLevel: 'verbose',
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

## Support

### Getting Help

1. Check the troubleshooting section
2. Review LinkedIn's developer documentation
3. Monitor automation logs for issues
4. Join community forums for best practices

### Contributing

To contribute to this skill:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This skill is provided under the MIT License. See LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- Basic LinkedIn automation
- Content management features
- Scheduling capabilities
- Analytics and reporting

---

**Note**: Always ensure compliance with LinkedIn's terms of service and applicable laws when using automation tools.
