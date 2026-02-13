/**
 * LinkedIn Content Manager - Handles content creation and management
 * 
 * Provides tools for drafting, editing, and managing LinkedIn content
 * with templates, optimization, and brand consistency features.
 */

import { LinkedInAutomation } from './linkedin-automation.js';
import fs from 'fs/promises';
import path from 'path';

export class ContentManager {
  constructor(linkedinAutomation) {
    this.linkedin = linkedinAutomation;
    this.templates = new Map();
    this.contentLibrary = new Map();
    this.brandGuidelines = {
      tone: 'professional',
      hashtags: ['#business', '#innovation', '#technology'],
      maxHashtags: 10,
      contentLength: { min: 100, max: 3000 }
    };
    
    this.loadTemplates();
    this.loadContentLibrary();
  }

  /**
   * Load content templates
   */
  async loadTemplates() {
    const templates = {
      'business-milestone': {
        name: 'Business Milestone',
        structure: `Excited to share a major milestone! 🎉

{achievement}

This accomplishment represents the hard work and dedication of our amazing team. A huge thank you to everyone who made this possible!

Key highlights:
• {highlight1}
• {highlight2}
• {highlight3}

Looking forward to what's next! 🚀

{hashtags}`,
        variables: ['achievement', 'highlight1', 'highlight2', 'highlight3'],
        defaultHashtags: ['#milestone', '#achievement', '#business', '#success', '#teamwork']
      },
      
      'product-launch': {
        name: 'Product Launch',
        structure: `🚀 BIG NEWS! We're thrilled to announce the launch of {productName}!

{productDescription}

Key features:
• {feature1}
• {feature2}
• {feature3}

This launch represents {impactStatement}. We can't wait for you to experience what we've built!

{callToAction}

{hashtags}`,
        variables: ['productName', 'productDescription', 'feature1', 'feature2', 'feature3', 'impactStatement', 'callToAction'],
        defaultHashtags: ['#launch', '#product', '#innovation', '#newproduct', '#technology']
      },
      
      'team-growth': {
        name: 'Team Growth',
        structure: `Growing our team, growing our impact! 👥

Excited to welcome {newTeamMemberCount} talented professionals to the {teamName} team!

Our new team members bring expertise in:
• {expertise1}
• {expertise2}
• {expertise3}

With {totalTeamSize} team members now, we're better positioned to {companyMission}.

Welcome aboard! 🎉

{hashtags}`,
        variables: ['newTeamMemberCount', 'teamName', 'expertise1', 'expertise2', 'expertise3', 'totalTeamSize', 'companyMission'],
        defaultHashtags: ['#hiring', '#teamwork', '#growth', '#careers', '#companyculture']
      },
      
      'industry-insight': {
        name: 'Industry Insight',
        structure: `Industry insights that matter 💡

{insightTitle}

{insightContent}

Key takeaways:
• {takeaway1}
• {takeaway2}
• {takeaway3}

This trend is shaping the future of {industry}. Organizations that adapt will {expectedOutcome}.

What are your thoughts on this development? 👇

{hashtags}`,
        variables: ['insightTitle', 'insightContent', 'takeaway1', 'takeaway2', 'takeaway3', 'industry', 'expectedOutcome'],
        defaultHashtags: ['#insights', '#industry', '#trends', '#analysis', '#future']
      }
    };

    for (const [key, template] of Object.entries(templates)) {
      this.templates.set(key, template);
    }
  }

  /**
   * Load existing content library
   */
  async loadContentLibrary() {
    try {
      const libraryPath = 'content-library.json';
      const data = await fs.readFile(libraryPath, 'utf8');
      const library = JSON.parse(data);
      
      for (const [id, content] of Object.entries(library)) {
        this.contentLibrary.set(id, content);
      }
      
    } catch (error) {
      // File doesn't exist or is invalid, start with empty library
      console.log('Content library not found, starting fresh');
    }
  }

  /**
   * Create post from template
   */
  async createFromTemplate(templateName, variables, options = {}) {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      // Validate required variables
      const missingVars = template.variables.filter(v => !variables[v]);
      if (missingVars.length > 0) {
        throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
      }

      // Generate content from template
      let content = template.structure;
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{${key}}`, 'g'), value);
      }

      // Apply brand guidelines
      const post = {
        content: this.applyBrandGuidelines(content),
        hashtags: options.hashtags || template.defaultHashtags,
        template: templateName,
        variables: variables,
        ...options
      };

      // Create draft post
      const draftedPost = await this.linkedin.draftPost(post);
      
      // Add to content library
      this.contentLibrary.set(draftedPost.id, {
        ...draftedPost,
        template: templateName,
        createdAt: new Date()
      });

      await this.saveContentLibrary();
      
      return draftedPost;
      
    } catch (error) {
      console.error('Error creating from template:', error);
      throw error;
    }
  }

  /**
   * Apply brand guidelines to content
   */
  applyBrandGuidelines(content) {
    // Ensure content length is within limits
    if (content.length < this.brandGuidelines.contentLength.min) {
      console.warn(`Content is shorter than recommended minimum (${this.brandGuidelines.contentLength.min} chars)`);
    }
    
    if (content.length > this.brandGuidelines.contentLength.max) {
      content = content.substring(0, this.brandGuidelines.contentLength.max - 3) + '...';
    }

    // Apply tone adjustments
    content = this.adjustTone(content, this.brandGuidelines.tone);

    return content;
  }

  /**
   * Adjust content tone
   */
  adjustTone(content, tone) {
    switch (tone) {
      case 'professional':
        // Remove excessive emojis and casual language
        content = content.replace(/([😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🥰😍🤩😘😗😚😙😋😛😜🤪😝🤑🤗🤭🤫🤔🤐🤨😐😑😶😏😒🙄😬😮😯😲😴🤤😪😵🤯🤠🥳🥸😎🤓🧐😕😟🙁☹️😮😯😲😳🥺😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀☠️💩🤡👹👺👻👽👾🤖🎃😺😸😹😻😼😽🙀😿😾])/g, '');
        content = content.replace(/\b(awesome|cool|super|totally|literally)\b/gi, 'excellent');
        break;
      
      case 'casual':
        // Add more conversational elements
        if (!content.includes('!') && !content.includes('?')) {
          content += '!';
        }
        break;
      
      default:
        // Keep original tone
        break;
    }

    return content;
  }

  /**
   * Optimize content for engagement
   */
  async optimizeContent(content, targetAudience, goals) {
    try {
      const optimization = {
        originalContent: content,
        suggestions: [],
        optimizedContent: content,
        score: 0
      };

      // Analyze content for improvements
      const analysis = this.analyzeContent(content);
      
      // Generate suggestions based on goals
      if (goals.includes('engagement')) {
        optimization.suggestions.push(...this.generateEngagementSuggestions(analysis));
      }
      
      if (goals.includes('reach')) {
        optimization.suggestions.push(...this.generateReachSuggestions(analysis));
      }
      
      if (goals.includes('leads')) {
        optimization.suggestions.push(...this.generateLeadSuggestions(analysis));
      }

      // Apply top suggestions
      optimization.optimizedContent = this.applySuggestions(content, optimization.suggestions.slice(0, 3));
      
      // Calculate optimization score
      optimization.score = this.calculateOptimizationScore(analysis, goals);

      return optimization;
      
    } catch (error) {
      console.error('Error optimizing content:', error);
      throw error;
    }
  }

  /**
   * Analyze content characteristics
   */
  analyzeContent(content) {
    return {
      length: content.length,
      wordCount: content.split(/\s+/).length,
      sentenceCount: content.split(/[.!?]+/).length,
      hashtagCount: (content.match(/#\w+/g) || []).length,
      emojiCount: (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length,
      questionCount: (content.match(/\?/g) || []).length,
      hasCallToAction: /\b(click|learn|discover|find|get|visit|check|try|join|sign up)\b/i.test(content),
      hasStatistics: /\d+%|\d+\s*(million|billion|thousand|percent)/i.test(content),
      hasMentions: /@\w+/.test(content)
    };
  }

  /**
   * Generate engagement optimization suggestions
   */
  generateEngagementSuggestions(analysis) {
    const suggestions = [];
    
    if (analysis.questionCount === 0) {
      suggestions.push({
        type: 'engagement',
        suggestion: 'Add a question to encourage comments',
        impact: 'high'
      });
    }
    
    if (analysis.emojiCount === 0) {
      suggestions.push({
        type: 'engagement',
        suggestion: 'Add relevant emojis to increase visual appeal',
        impact: 'medium'
      });
    }
    
    if (analysis.hashtagCount < 3) {
      suggestions.push({
        type: 'engagement',
        suggestion: 'Add more relevant hashtags (3-5 is optimal)',
        impact: 'medium'
      });
    }
    
    return suggestions;
  }

  /**
   * Generate reach optimization suggestions
   */
  generateReachSuggestions(analysis) {
    const suggestions = [];
    
    if (analysis.hashtagCount < 5) {
      suggestions.push({
        type: 'reach',
        suggestion: 'Increase hashtags to 5-8 for better discoverability',
        impact: 'high'
      });
    }
    
    if (!analysis.hasStatistics) {
      suggestions.push({
        type: 'reach',
        suggestion: 'Include statistics or data points for credibility',
        impact: 'medium'
      });
    }
    
    return suggestions;
  }

  /**
   * Generate lead generation suggestions
   */
  generateLeadSuggestions(analysis) {
    const suggestions = [];
    
    if (!analysis.hasCallToAction) {
      suggestions.push({
        type: 'leads',
        suggestion: 'Add a clear call-to-action to drive conversions',
        impact: 'high'
      });
    }
    
    if (analysis.wordCount < 50) {
      suggestions.push({
        type: 'leads',
        suggestion: 'Expand content to provide more value and context',
        impact: 'medium'
      });
    }
    
    return suggestions;
  }

  /**
   * Apply optimization suggestions to content
   */
  applySuggestions(content, suggestions) {
    let optimizedContent = content;
    
    for (const suggestion of suggestions) {
      switch (suggestion.type) {
        case 'engagement':
          if (suggestion.suggestion.includes('question')) {
            optimizedContent += '\n\nWhat are your thoughts on this? 👇';
          }
          break;
          
        case 'reach':
          if (suggestion.suggestion.includes('hashtags')) {
            optimizedContent += '\n\n#LinkedIn #Marketing #Business';
          }
          break;
          
        case 'leads':
          if (suggestion.suggestion.includes('call-to-action')) {
            optimizedContent += '\n\nLearn more: [link to your website]';
          }
          break;
      }
    }
    
    return optimizedContent;
  }

  /**
   * Calculate optimization score
   */
  calculateOptimizationScore(analysis, goals) {
    let score = 0;
    const maxScore = 100;
    
    // Base score for having content
    score += 20;
    
    // Length optimization
    if (analysis.wordCount >= 50 && analysis.wordCount <= 300) {
      score += 15;
    }
    
    // Hashtag optimization
    if (analysis.hashtagCount >= 3 && analysis.hashtagCount <= 8) {
      score += 15;
    }
    
    // Engagement features
    if (analysis.questionCount > 0) score += 10;
    if (analysis.emojiCount > 0 && analysis.emojiCount <= 3) score += 10;
    
    // Professional features
    if (analysis.hasStatistics) score += 10;
    if (analysis.hasCallToAction) score += 10;
    
    // Goal-specific scoring
    if (goals.includes('engagement') && analysis.questionCount > 0) score += 5;
    if (goals.includes('reach') && analysis.hashtagCount >= 5) score += 5;
    if (goals.includes('leads') && analysis.hasCallToAction) score += 5;
    
    return Math.min(score, maxScore);
  }

  /**
   * Save content library to file
   */
  async saveContentLibrary() {
    try {
      const library = {};
      for (const [id, content] of this.contentLibrary) {
        library[id] = content;
      }
      
      await fs.writeFile('content-library.json', JSON.stringify(library, null, 2));
      
    } catch (error) {
      console.error('Error saving content library:', error);
    }
  }

  /**
   * Get content performance analytics
   */
  async getContentAnalytics(postId) {
    try {
      const content = this.contentLibrary.get(postId);
      if (!content) {
        throw new Error(`Content not found: ${postId}`);
      }

      const metrics = await this.linkedin.getPostMetrics(postId);
      
      return {
        content: content,
        metrics: metrics,
        performance: this.calculatePerformanceScore(metrics),
        recommendations: this.generatePerformanceRecommendations(metrics)
      };
      
    } catch (error) {
      console.error('Error getting content analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(metrics) {
    // Simple scoring algorithm based on engagement rate
    const engagementRate = parseFloat(metrics.engagementRate);
    const views = metrics.views;
    
    let score = 0;
    
    // Base score for posting
    score += 20;
    
    // Engagement rate scoring
    if (engagementRate >= 5) score += 30;
    else if (engagementRate >= 3) score += 20;
    else if (engagementRate >= 1) score += 10;
    
    // Views scoring
    if (views >= 1000) score += 25;
    else if (views >= 500) score += 15;
    else if (views >= 100) score += 5;
    
    // Interaction diversity
    const interactionTypes = [
      metrics.likes > 0,
      metrics.comments > 0,
      metrics.shares > 0
    ].filter(Boolean).length;
    
    score += interactionTypes * 5;
    
    return Math.min(score, 100);
  }

  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations(metrics) {
    const recommendations = [];
    
    const engagementRate = parseFloat(metrics.engagementRate);
    
    if (engagementRate < 1) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        recommendation: 'Consider adding more engaging questions or calls-to-action',
        expectedImpact: 'Increase engagement rate by 2-3%'
      });
    }
    
    if (metrics.comments < 5) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        recommendation: 'Post content that encourages discussion and comments',
        expectedImpact: 'Increase comment rate by 50%'
      });
    }
    
    if (metrics.shares < 2) {
      recommendations.push({
        type: 'reach',
        priority: 'medium',
        recommendation: 'Create more shareable content with valuable insights',
        expectedImpact: 'Increase share rate by 100%'
      });
    }
    
    return recommendations;
  }

  /**
   * Create content calendar
   */
  async createContentCalendar(startDate, endDate, themes = []) {
    try {
      const calendar = [];
      const current = new Date(startDate);
      const end = new Date(endDate);
      
      while (current <= end) {
        // Skip weekends
        if (current.getDay() !== 0 && current.getDay() !== 6) {
          const dayContent = {
            date: new Date(current),
            theme: themes[Math.floor(Math.random() * themes.length)] || 'general',
            suggestedTemplate: this.getRandomTemplate(),
            status: 'planned'
          };
          
          calendar.push(dayContent);
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      return calendar;
      
    } catch (error) {
      console.error('Error creating content calendar:', error);
      throw error;
    }
  }

  /**
   * Get random template for calendar
   */
  getRandomTemplate() {
    const templates = Array.from(this.templates.keys());
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Batch create posts from calendar
   */
  async batchCreateFromCalendar(calendar, variablesMap) {
    try {
      const createdPosts = [];
      
      for (const day of calendar) {
        if (variablesMap[day.date.toDateString()]) {
          const post = await this.createFromTemplate(
            day.suggestedTemplate,
            variablesMap[day.date.toDateString()]
          );
          
          createdPosts.push({
            calendarDay: day,
            post: post,
            status: 'created'
          });
        }
      }
      
      return createdPosts;
      
    } catch (error) {
      console.error('Error batch creating posts:', error);
      throw error;
    }
  }
}

export default ContentManager;
