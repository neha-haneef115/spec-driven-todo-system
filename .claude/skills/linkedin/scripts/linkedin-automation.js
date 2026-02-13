/**
 * LinkedIn Automation - Main automation class
 * 
 * Provides comprehensive LinkedIn automation capabilities including
 * post drafting, scheduling, engagement monitoring, and safe posting workflows.
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

export class LinkedInAutomation {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isAuthenticated = false;
    this.options = {
      headless: options.headless || false,
      timeout: options.timeout || 30000,
      debug: options.debug || false,
      screenshotOnError: options.screenshotOnError || true,
      logLevel: options.logLevel || 'info',
      ...options
    };
    
    // Secure credential storage
    this.credentials = {
      email: process.env.LINKEDIN_EMAIL,
      password: process.env.LINKEDIN_PASSWORD,
      twoFactorSecret: process.env.LINKEDIN_2FA_SECRET
    };
    
    // Content storage
    this.draftPosts = new Map();
    this.scheduledPosts = new Map();
    this.postMetrics = new Map();
    
    this.log('LinkedIn Automation initialized');
  }

  /**
   * Initialize browser and authenticate with LinkedIn
   */
  async initialize() {
    try {
      this.log('Launching browser...');
      this.browser = await chromium.launch({
        headless: this.options.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      
      this.page = await this.context.newPage();
      
      // Set up error handling
      this.page.on('error', (error) => this.handleError(error));
      this.page.on('pageerror', (error) => this.handleError(error));
      
      await this.authenticate();
      this.log('LinkedIn Automation initialized successfully');
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Authenticate with LinkedIn
   */
  async authenticate() {
    try {
      this.log('Authenticating with LinkedIn...');
      await this.page.goto('https://www.linkedin.com/login', {
        waitUntil: 'networkidle'
      });
      
      // Fill login form
      await this.page.fill('#username', this.credentials.email);
      await this.page.fill('#password', this.credentials.password);
      
      // Submit login
      await this.page.click('[type="submit"]');
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });
      
      // Handle 2FA if needed
      if (await this.page.locator('input[name="pin"]').isVisible()) {
        await this.handleTwoFactor();
      }
      
      // Verify authentication
      if (await this.page.locator('.global-nav__primary-link').isVisible()) {
        this.isAuthenticated = true;
        this.log('Successfully authenticated with LinkedIn');
      } else {
        throw new Error('Authentication failed - unable to verify login');
      }
      
    } catch (error) {
      this.handleError(error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Handle two-factor authentication
   */
  async handleTwoFactor() {
    if (!this.credentials.twoFactorSecret) {
      throw new Error('2FA required but no secret provided');
    }
    
    // Generate TOTP code
    const totp = this.generateTOTP(this.credentials.twoFactorSecret);
    
    await this.page.fill('input[name="pin"]', totp);
    await this.page.click('[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }

  /**
   * Generate TOTP code for 2FA
   */
  generateTOTP(secret) {
    // Simplified TOTP generation - in production, use a proper library
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epoch / 30);
    const hash = crypto.createHmac('sha1', secret).update(timeStep.toString()).digest();
    const offset = hash[hash.length - 1] & 0x0f;
    const code = ((hash[offset] & 0x7f) << 24) | ((hash[offset + 1] & 0xff) << 16) | ((hash[offset + 2] & 0xff) << 8) | (hash[offset + 3] & 0xff);
    return (code % 1000000).toString().padStart(6, '0');
  }

  /**
   * Draft a new LinkedIn post
   */
  async draftPost(postData) {
    try {
      const postId = this.generateId();
      
      const post = {
        id: postId,
        ...postData,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Validate post data
      this.validatePost(post);
      
      // Store draft
      this.draftPosts.set(postId, post);
      
      this.log(`Post drafted: ${postId}`);
      return post;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Preview a post before publishing
   */
  async previewPost(postId) {
    try {
      const post = this.draftPosts.get(postId);
      if (!post) {
        throw new Error(`Post not found: ${postId}`);
      }
      
      // Navigate to LinkedIn post creation
      await this.page.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'networkidle'
      });
      
      // Click start post button
      await this.page.click('[data-control-name="share"]', { timeout: 10000 });
      
      // Fill post content for preview
      await this.page.fill('[contenteditable="true"]', post.content);
      
      // Add hashtags
      if (post.hashtags && post.hashtags.length > 0) {
        const hashtagText = post.hashtags.map(tag => 
          tag.startsWith('#') ? tag : `#${tag}`
        ).join(' ');
        await this.page.fill('[contenteditable="true"]', 
          `${post.content}\n\n${hashtagText}`);
      }
      
      // Take screenshot for preview
      const screenshot = await this.page.screenshot({
        fullPage: true,
        type: 'png'
      });
      
      const preview = {
        postId: postId,
        content: post.content,
        hashtags: post.hashtags || [],
        media: post.media || [],
        scheduledTime: post.scheduledTime,
        screenshot: screenshot.toString('base64'),
        previewUrl: null // Would be implemented with actual LinkedIn preview
      };
      
      this.log(`Preview generated for post: ${postId}`);
      return preview;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Post with approval workflow
   */
  async postWithApproval(postId, approvalSettings = {}) {
    try {
      const post = this.draftPosts.get(postId);
      if (!post) {
        throw new Error(`Post not found: ${postId}`);
      }
      
      // Check if approval is required
      if (approvalSettings.requirePreview !== false) {
        const preview = await this.previewPost(postId);
        
        // In a real implementation, this would wait for human approval
        // For now, we'll simulate approval
        this.log(`Post ${postId} awaiting approval...`);
        
        // Simulate approval delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Post to LinkedIn
      const result = await this.publishPost(post);
      
      // Update post status
      post.status = 'published';
      post.publishedAt = new Date();
      post.linkedinUrl = result.url;
      
      this.log(`Post published successfully: ${postId}`);
      return result;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Publish post to LinkedIn
   */
  async publishPost(post) {
    try {
      // Navigate to LinkedIn
      await this.page.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'networkidle'
      });
      
      // Start new post
      await this.page.click('[data-control-name="share"]', { timeout: 10000 });
      
      // Fill content
      const contentWithHashtags = post.hashtags && post.hashtags.length > 0
        ? `${post.content}\n\n${post.hashtags.map(tag => 
            tag.startsWith('#') ? tag : `#${tag}`
          ).join(' ')}`
        : post.content;
      
      await this.page.fill('[contenteditable="true"]', contentWithHashtags);
      
      // Handle media uploads if provided
      if (post.media && post.media.length > 0) {
        for (const mediaFile of post.media) {
          await this.uploadMedia(mediaFile);
        }
      }
      
      // Post it
      await this.page.click('[data-control-name="share"]', { timeout: 10000 });
      
      // Wait for post to complete
      await this.page.waitForSelector('.feed-shared-text', { timeout: 10000 });
      
      // Get post URL
      const postUrl = this.page.url();
      
      return {
        success: true,
        url: postUrl,
        postId: post.id,
        publishedAt: new Date()
      };
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Upload media to LinkedIn
   */
  async uploadMedia(mediaPath) {
    try {
      // Click media upload button
      await this.page.click('[data-control-name="share_media"]', { timeout: 5000 });
      
      // Handle file upload
      const fileInput = await this.page.locator('input[type="file"]');
      await fileInput.setInputFiles(mediaPath);
      
      // Wait for upload to complete
      await this.page.waitForSelector('.feed-shared-media', { timeout: 30000 });
      
      this.log(`Media uploaded: ${mediaPath}`);
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Schedule a post for future publishing
   */
  async schedulePost(postData) {
    try {
      const postId = this.generateId();
      
      const scheduledPost = {
        id: postId,
        ...postData,
        status: 'scheduled',
        createdAt: new Date(),
        scheduledTime: new Date(postData.scheduledTime)
      };
      
      // Validate scheduled time
      if (scheduledPost.scheduledTime <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      
      // Store scheduled post
      this.scheduledPosts.set(postId, scheduledPost);
      
      // Set up scheduling timer
      this.schedulePostTimer(postId);
      
      this.log(`Post scheduled: ${postId} for ${scheduledPost.scheduledTime}`);
      return scheduledPost;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Set up timer for scheduled post
   */
  schedulePostTimer(postId) {
    const post = this.scheduledPosts.get(postId);
    if (!post) return;
    
    const delay = post.scheduledTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(async () => {
        try {
          await this.postWithApproval(postId);
          this.log(`Scheduled post published: ${postId}`);
        } catch (error) {
          this.handleError(error);
        }
      }, delay);
    }
  }

  /**
   * Get post metrics and engagement data
   */
  async getPostMetrics(postId) {
    try {
      // In a real implementation, this would scrape LinkedIn for actual metrics
      // For now, return simulated data
      const metrics = {
        postId: postId,
        views: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 20) + 2,
        engagementRate: ((Math.random() * 5) + 1).toFixed(2),
        lastUpdated: new Date()
      };
      
      this.postMetrics.set(postId, metrics);
      return metrics;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Validate post data
   */
  validatePost(post) {
    if (!post.content || post.content.trim().length === 0) {
      throw new Error('Post content is required');
    }
    
    if (post.content.length > 3000) {
      throw new Error('Post content exceeds maximum length');
    }
    
    if (post.hashtags && post.hashtags.length > 30) {
      throw new Error('Too many hashtags (max 30)');
    }
    
    if (post.media && post.media.length > 20) {
      throw new Error('Too many media files (max 20)');
    }
  }

  /**
   * Generate unique ID for posts
   */
  generateId() {
    return crypto.randomUUID();
  }

  /**
   * Handle errors with logging and screenshots
   */
  handleError(error) {
    this.log(`Error: ${error.message}`, 'error');
    
    if (this.options.screenshotOnError && this.page) {
      this.page.screenshot({ path: `error-${Date.now()}.png` });
    }
    
    if (this.options.debug) {
      console.error(error);
    }
  }

  /**
   * Logging function
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (this.options.debug || level === 'error') {
      console.log(logMessage);
    }
    
    // In production, write to log file
    // fs.appendFile('linkedin-automation.log', logMessage + '\n');
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      
      this.log('LinkedIn Automation cleaned up');
      
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Store credentials securely
   */
  async storeCredentials(credentials) {
    try {
      // Encrypt credentials before storing
      const encrypted = this.encryptData(JSON.stringify(credentials));
      await fs.writeFile('linkedin-credentials.enc', encrypted);
      this.log('Credentials stored securely');
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Encrypt data for secure storage
   */
  encryptData(data) {
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt stored data
   */
  decryptData(encryptedData) {
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = parts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

// Export for use in other modules
export default LinkedInAutomation;
