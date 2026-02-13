/**
 * LinkedIn Post Scheduler - Handles post scheduling and automation
 * 
 * Provides comprehensive scheduling capabilities including time optimization,
 * recurring posts, and automated publishing workflows.
 */

import { ContentManager } from './content-manager.js';
import fs from 'fs/promises';
import path from 'path';

export class PostScheduler {
  constructor(linkedinAutomation, contentManager) {
    this.linkedin = linkedinAutomation;
    this.contentManager = contentManager;
    this.scheduledPosts = new Map();
    this.scheduleQueue = [];
    this.isRunning = false;
    this.optimizationData = new Map();
    
    this.loadScheduleData();
    this.startScheduler();
  }

  /**
   * Load existing schedule data
   */
  async loadScheduleData() {
    try {
      const schedulePath = 'post-schedule.json';
      const data = await fs.readFile(schedulePath, 'utf8');
      const schedule = JSON.parse(data);
      
      for (const [id, post] of Object.entries(schedule)) {
        this.scheduledPosts.set(id, {
          ...post,
          scheduledTime: new Date(post.scheduledTime),
          createdAt: new Date(post.createdAt)
        });
      }
      
      // Rebuild queue from scheduled posts
      this.rebuildQueue();
      
    } catch (error) {
      console.log('No existing schedule data found, starting fresh');
    }
  }

  /**
   * Save schedule data to file
   */
  async saveScheduleData() {
    try {
      const schedule = {};
      for (const [id, post] of this.scheduledPosts) {
        schedule[id] = post;
      }
      
      await fs.writeFile('post-schedule.json', JSON.stringify(schedule, null, 2));
      
    } catch (error) {
      console.error('Error saving schedule data:', error);
    }
  }

  /**
   * Start the scheduler service
   */
  startScheduler() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Check schedule every minute
    setInterval(() => {
      this.processScheduleQueue();
    }, 60000);
    
    console.log('Post scheduler started');
  }

  /**
   * Stop the scheduler service
   */
  stopScheduler() {
    this.isRunning = false;
    console.log('Post scheduler stopped');
  }

  /**
   * Schedule a post for specific time
   */
  async schedulePost(postData, options = {}) {
    try {
      const postId = this.generateId();
      
      const scheduledPost = {
        id: postId,
        ...postData,
        status: 'scheduled',
        createdAt: new Date(),
        scheduledTime: new Date(postData.scheduledTime),
        timezone: options.timezone || 'UTC',
        priority: options.priority || 'normal',
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
        notifications: options.notifications || {
          email: true,
          reminder: true,
          reminderTime: 30 // minutes before
        },
        optimization: options.optimization || false
      };

      // Validate scheduled time
      if (scheduledPost.scheduledTime <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      // Optimize posting time if requested
      if (scheduledPost.optimization) {
        const optimizedTime = await this.optimizePostingTime(scheduledPost);
        scheduledPost.scheduledTime = optimizedTime;
        scheduledPost.originalTime = new Date(postData.scheduledTime);
      }

      // Store scheduled post
      this.scheduledPosts.set(postId, scheduledPost);
      
      // Add to queue
      this.addToQueue(scheduledPost);
      
      // Set up notifications
      if (scheduledPost.notifications.reminder) {
        this.scheduleReminder(postId);
      }

      await this.saveScheduleData();
      
      console.log(`Post scheduled: ${postId} for ${scheduledPost.scheduledTime}`);
      return scheduledPost;
      
    } catch (error) {
      console.error('Error scheduling post:', error);
      throw error;
    }
  }

  /**
   * Schedule recurring posts
   */
  async scheduleRecurringPost(postData, recurrence) {
    try {
      const posts = [];
      const startDate = new Date(recurrence.startDate);
      const endDate = new Date(recurrence.endDate);
      
      const current = new Date(startDate);
      
      while (current <= endDate) {
        // Check if this date matches the recurrence pattern
        if (this.matchesRecurrencePattern(current, recurrence)) {
          const scheduledTime = new Date(current);
          
          // Set specific time if provided
          if (recurrence.time) {
            const [hours, minutes] = recurrence.time.split(':');
            scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }
          
          const post = await this.schedulePost({
            ...postData,
            scheduledTime: scheduledTime
          }, {
            recurring: true,
            recurrenceId: recurrence.id
          });
          
          posts.push(post);
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      return posts;
      
    } catch (error) {
      console.error('Error scheduling recurring posts:', error);
      throw error;
    }
  }

  /**
   * Check if date matches recurrence pattern
   */
  matchesRecurrencePattern(date, recurrence) {
    switch (recurrence.pattern) {
      case 'daily':
        return true;
        
      case 'weekly':
        const dayOfWeek = date.getDay();
        return recurrence.daysOfWeek.includes(dayOfWeek);
        
      case 'monthly':
        const dayOfMonth = date.getDate();
        return recurrence.daysOfMonth.includes(dayOfMonth);
        
      case 'weekdays':
        const day = date.getDay();
        return day >= 1 && day <= 5; // Monday-Friday
        
      default:
        return false;
    }
  }

  /**
   * Optimize posting time based on historical data
   */
  async optimizePostingTime(post) {
    try {
      // Load optimization data
      const optimizationData = await this.loadOptimizationData();
      
      // Get best posting times
      const bestTimes = this.getBestPostingTimes(optimizationData, post);
      
      if (bestTimes.length > 0) {
        // Find closest optimal time to original scheduled time
        const originalTime = new Date(post.scheduledTime);
        const optimizedTime = this.findClosestOptimalTime(originalTime, bestTimes);
        
        return optimizedTime;
      }
      
      return post.scheduledTime;
      
    } catch (error) {
      console.error('Error optimizing posting time:', error);
      return post.scheduledTime;
    }
  }

  /**
   * Load optimization data
   */
  async loadOptimizationData() {
    try {
      const dataPath = 'posting-optimization.json';
      const data = await fs.readFile(dataPath, 'utf8');
      return JSON.parse(data);
      
    } catch (error) {
      // Return default optimization data
      return this.getDefaultOptimizationData();
    }
  }

  /**
   * Get default optimization data
   */
  getDefaultOptimizationData() {
    return {
      bestTimes: [
        { day: 1, hour: 9, minute: 0, engagement: 4.2 }, // Monday 9 AM
        { day: 1, hour: 12, minute: 0, engagement: 3.8 }, // Monday 12 PM
        { day: 2, hour: 10, minute: 30, engagement: 4.5 }, // Tuesday 10:30 AM
        { day: 3, hour: 14, minute: 0, engagement: 4.1 }, // Wednesday 2 PM
        { day: 4, hour: 11, minute: 0, engagement: 4.3 }, // Thursday 11 AM
        { day: 5, hour: 9, minute: 0, engagement: 3.9 }  // Friday 9 AM
      ]
    };
  }

  /**
   * Get best posting times for specific post type
   */
  getBestPostingTimes(optimizationData, post) {
    // Filter by post type if available
    const postType = this.getPostType(post);
    
    if (postType && optimizationData[postType]) {
      return optimizationData[postType].bestTimes || [];
    }
    
    return optimizationData.bestTimes || [];
  }

  /**
   * Determine post type
   */
  getPostType(post) {
    if (post.template) {
      return post.template;
    }
    
    // Analyze content to determine type
    const content = post.content.toLowerCase();
    
    if (content.includes('launch') || content.includes('new product')) {
      return 'product-launch';
    }
    
    if (content.includes('milestone') || content.includes('achievement')) {
      return 'business-milestone';
    }
    
    if (content.includes('hiring') || content.includes('team')) {
      return 'team-growth';
    }
    
    return 'general';
  }

  /**
   * Find closest optimal time to original time
   */
  findClosestOptimalTime(originalTime, bestTimes) {
    let closestTime = null;
    let minDifference = Infinity;
    
    for (const bestTime of bestTimes) {
      const optimalDate = new Date(originalTime);
      optimalDate.setDate(
        optimalDate.getDate() + 
        ((bestTime.day - optimalDate.getDay() + 7) % 7)
      );
      optimalDate.setHours(bestTime.hour, bestTime.minute, 0, 0);
      
      const difference = Math.abs(optimalDate.getTime() - originalTime.getTime());
      
      if (difference < minDifference) {
        minDifference = difference;
        closestTime = optimalDate;
      }
    }
    
    return closestTime || originalTime;
  }

  /**
   * Add post to scheduling queue
   */
  addToQueue(post) {
    this.scheduleQueue.push(post);
    this.scheduleQueue.sort((a, b) => a.scheduledTime - b.scheduledTime);
  }

  /**
   * Rebuild queue from scheduled posts
   */
  rebuildQueue() {
    this.scheduleQueue = Array.from(this.scheduledPosts.values())
      .filter(post => post.status === 'scheduled')
      .sort((a, b) => a.scheduledTime - b.scheduledTime);
  }

  /**
   * Process schedule queue
   */
  async processScheduleQueue() {
    if (!this.isRunning || this.scheduleQueue.length === 0) {
      return;
    }
    
    const now = new Date();
    const postsToPublish = this.scheduleQueue.filter(post => 
      post.scheduledTime <= now && post.status === 'scheduled'
    );
    
    for (const post of postsToPublish) {
      try {
        await this.publishScheduledPost(post);
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);
        await this.handlePublishError(post, error);
      }
    }
  }

  /**
   * Publish scheduled post
   */
  async publishScheduledPost(post) {
    try {
      console.log(`Publishing scheduled post: ${post.id}`);
      
      // Update status
      post.status = 'publishing';
      await this.saveScheduleData();
      
      // Publish the post
      const result = await this.linkedin.postWithApproval(post.id);
      
      // Update post with result
      post.status = 'published';
      post.publishedAt = new Date();
      post.linkedinUrl = result.url;
      post.publishResult = result;
      
      // Remove from queue
      this.scheduleQueue = this.scheduleQueue.filter(p => p.id !== post.id);
      
      await this.saveScheduleData();
      
      // Record optimization data
      await this.recordOptimizationData(post);
      
      console.log(`Successfully published post: ${post.id}`);
      
    } catch (error) {
      post.status = 'failed';
      post.error = error.message;
      await this.saveScheduleData();
      throw error;
    }
  }

  /**
   * Handle publishing errors
   */
  async handlePublishError(post, error) {
    post.retryCount = (post.retryCount || 0) + 1;
    
    if (post.retryCount < post.maxRetries) {
      // Schedule retry for 5 minutes later
      const retryTime = new Date(Date.now() + 5 * 60 * 1000);
      post.scheduledTime = retryTime;
      post.status = 'retrying';
      
      console.log(`Retrying post ${post.id} at ${retryTime}`);
      
    } else {
      post.status = 'failed';
      post.error = error.message;
      
      console.error(`Post ${post.id} failed after ${post.maxRetries} retries`);
    }
    
    await this.saveScheduleData();
  }

  /**
   * Schedule reminder notification
   */
  scheduleReminder(postId) {
    const post = this.scheduledPosts.get(postId);
    if (!post) return;
    
    const reminderTime = new Date(
      post.scheduledTime.getTime() - (post.notifications.reminderTime * 60 * 1000)
    );
    
    const delay = reminderTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        this.sendReminder(postId);
      }, delay);
    }
  }

  /**
   * Send reminder notification
   */
  async sendReminder(postId) {
    const post = this.scheduledPosts.get(postId);
    if (!post) return;
    
    console.log(`Reminder: Post "${post.id}" scheduled for ${post.scheduledTime}`);
    
    // In a real implementation, this would send email/push notification
    // For now, just log the reminder
  }

  /**
   * Record optimization data
   */
  async recordOptimizationData(post) {
    try {
      // Get post metrics after publishing
      const metrics = await this.linkedin.getPostMetrics(post.id);
      
      const optimizationRecord = {
        postId: post.id,
        postType: this.getPostType(post),
        scheduledTime: post.scheduledTime,
        publishedTime: post.publishedAt,
        metrics: metrics,
        optimization: post.optimization
      };
      
      // Store for future optimization
      const optimizationData = await this.loadOptimizationData();
      
      if (!optimizationData.records) {
        optimizationData.records = [];
      }
      
      optimizationData.records.push(optimizationRecord);
      
      // Update best times based on performance
      this.updateBestTimes(optimizationData);
      
      await fs.writeFile('posting-optimization.json', JSON.stringify(optimizationData, null, 2));
      
    } catch (error) {
      console.error('Error recording optimization data:', error);
    }
  }

  /**
   * Update best posting times based on performance
   */
  updateBestTimes(optimizationData) {
    const records = optimizationData.records || [];
    
    // Group by day of week and hour
    const performanceByTime = {};
    
    for (const record of records) {
      const publishedTime = new Date(record.publishedTime);
      const day = publishedTime.getDay();
      const hour = publishedTime.getHours();
      const minute = publishedTime.getMinutes();
      
      const key = `${day}-${hour}-${minute}`;
      
      if (!performanceByTime[key]) {
        performanceByTime[key] = {
          day: day,
          hour: hour,
          minute: minute,
          totalEngagement: 0,
          postCount: 0
        };
      }
      
      performanceByTime[key].totalEngagement += parseFloat(record.metrics.engagementRate);
      performanceByTime[key].postCount++;
    }
    
    // Calculate average engagement and update best times
    const bestTimes = Object.values(performanceByTime)
      .map(time => ({
        ...time,
        engagement: time.totalEngagement / time.postCount
      }))
      .filter(time => time.postCount >= 3) // Only include times with sufficient data
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10); // Keep top 10 times
    
    optimizationData.bestTimes = bestTimes;
  }

  /**
   * Get schedule overview
   */
  getScheduleOverview() {
    const overview = {
      total: this.scheduledPosts.size,
      scheduled: 0,
      published: 0,
      failed: 0,
      retrying: 0,
      upcoming: []
    };
    
    for (const post of this.scheduledPosts.values()) {
      overview[post.status] = (overview[post.status] || 0) + 1;
      
      if (post.status === 'scheduled' && post.scheduledTime > new Date()) {
        overview.upcoming.push({
          id: post.id,
          scheduledTime: post.scheduledTime,
          content: post.content.substring(0, 100) + '...'
        });
      }
    }
    
    // Sort upcoming by time
    overview.upcoming.sort((a, b) => a.scheduledTime - b.scheduledTime);
    
    return overview;
  }

  /**
   * Cancel scheduled post
   */
  async cancelScheduledPost(postId) {
    try {
      const post = this.scheduledPosts.get(postId);
      if (!post) {
        throw new Error(`Post not found: ${postId}`);
      }
      
      if (post.status === 'published') {
        throw new Error('Cannot cancel published post');
      }
      
      post.status = 'cancelled';
      post.cancelledAt = new Date();
      
      // Remove from queue
      this.scheduleQueue = this.scheduleQueue.filter(p => p.id !== postId);
      
      await this.saveScheduleData();
      
      console.log(`Post cancelled: ${postId}`);
      return post;
      
    } catch (error) {
      console.error('Error cancelling post:', error);
      throw error;
    }
  }

  /**
   * Reschedule post
   */
  async reschedulePost(postId, newScheduledTime, options = {}) {
    try {
      const post = this.scheduledPosts.get(postId);
      if (!post) {
        throw new Error(`Post not found: ${postId}`);
      }
      
      if (post.status === 'published') {
        throw new Error('Cannot reschedule published post');
      }
      
      // Update scheduled time
      post.scheduledTime = new Date(newScheduledTime);
      post.status = 'scheduled';
      post.rescheduledAt = new Date();
      
      // Re-optimize if requested
      if (options.reoptimize) {
        const optimizedTime = await this.optimizePostingTime(post);
        post.scheduledTime = optimizedTime;
      }
      
      // Rebuild queue
      this.rebuildQueue();
      
      await this.saveScheduleData();
      
      console.log(`Post rescheduled: ${postId} to ${post.scheduledTime}`);
      return post;
      
    } catch (error) {
      console.error('Error rescheduling post:', error);
      throw error;
    }
  }

  /**
   * Generate schedule report
   */
  async generateScheduleReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const report = {
        period: { start, end },
        totalPosts: 0,
        publishedPosts: 0,
        failedPosts: 0,
        averageEngagement: 0,
        bestPerformingTime: null,
        recommendations: []
      };
      
      const relevantPosts = Array.from(this.scheduledPosts.values())
        .filter(post => post.publishedAt && post.publishedAt >= start && post.publishedAt <= end);
      
      report.totalPosts = relevantPosts.length;
      
      let totalEngagement = 0;
      const performanceByTime = {};
      
      for (const post of relevantPosts) {
        if (post.status === 'published') {
          report.publishedPosts++;
          
          const metrics = await this.linkedin.getPostMetrics(post.id);
          totalEngagement += parseFloat(metrics.engagementRate);
          
          // Track performance by time
          const hour = post.publishedAt.getHours();
          if (!performanceByTime[hour]) {
            performanceByTime[hour] = { totalEngagement: 0, count: 0 };
          }
          performanceByTime[hour].totalEngagement += parseFloat(metrics.engagementRate);
          performanceByTime[hour].count++;
          
        } else if (post.status === 'failed') {
          report.failedPosts++;
        }
      }
      
      report.averageEngagement = report.publishedPosts > 0 ? totalEngagement / report.publishedPosts : 0;
      
      // Find best performing time
      let bestHour = null;
      let bestEngagement = 0;
      
      for (const [hour, data] of Object.entries(performanceByTime)) {
        const avgEngagement = data.totalEngagement / data.count;
        if (avgEngagement > bestEngagement) {
          bestEngagement = avgEngagement;
          bestHour = parseInt(hour);
        }
      }
      
      report.bestPerformingTime = bestHour;
      
      // Generate recommendations
      if (report.failedPosts > 0) {
        report.recommendations.push('Review failed posts and adjust scheduling or content');
      }
      
      if (report.averageEngagement < 2) {
        report.recommendations.push('Consider optimizing content and posting times for better engagement');
      }
      
      if (bestHour !== null) {
        report.recommendations.push(`Best performing time appears to be ${bestHour}:00 - consider scheduling more posts around this time`);
      }
      
      return report;
      
    } catch (error) {
      console.error('Error generating schedule report:', error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default PostScheduler;
