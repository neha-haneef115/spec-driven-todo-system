# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Taskly, please report it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: nehahaneef203@gmail.com

Include the following information in your report:
- Type of vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (if available)

### Response Time

We will acknowledge receipt of your vulnerability report within 48 hours and provide a detailed response within 7 days.

### Security Best Practices

This project follows several security best practices:

#### Authentication & Authorization
- Secure JWT-based session management
- Password strength requirements
- Rate limiting on authentication endpoints
- Secure password reset via email

#### Data Protection
- Environment variables for sensitive configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

#### Dependencies
- Regular dependency updates
- Security scanning of packages
- Minimal dependency footprint

#### Infrastructure
- HTTPS enforcement in production
- Secure headers configuration
- CORS policies

### Security Features

- **Authentication**: Better Auth integration with secure session management
- **Input Validation**: Zod schema validation for all inputs
- **Database Security**: Parameterized queries to prevent SQL injection
- **Email Security**: Secure SMTP configuration for password reset
- **Environment Security**: Sensitive data stored in environment variables

### Responsible Disclosure Policy

We believe in responsible disclosure and will:
- Respond to security reports promptly
- Keep reporters informed of our progress
- Credit researchers who discover vulnerabilities
- Work with researchers to understand and fix issues

Thank you for helping keep this project secure!
