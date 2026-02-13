# Contributing to Taskly

Thank you for your interest in contributing to Taskly! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Node.js 20+ installed on your system
- A package manager (npm, yarn, pnpm, or bun)
- Basic knowledge of React, Next.js, and TypeScript

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/neha-haneef115/spec-driven-todo-system.git
   cd my-app/phase-05/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Provide proper type definitions
- Avoid using `any` type when possible

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use proper prop types and interfaces

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Maintain responsive design principles

### File Organization
- Keep components in the `src/components` directory
- Place pages in the `src/app` directory (Next.js App Router)
- Use descriptive file and folder names

## Submitting Changes

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test them thoroughly

3. Commit your changes with a clear message:
   ```bash
   git commit -m "feat: add your feature description"
   ```

4. Push to your branch and create a pull request

## Pull Request Guidelines

- Provide a clear description of your changes
- Include screenshots for UI changes if applicable
- Ensure all tests pass
- Update documentation if needed

## Bug Reports

When reporting bugs, please include:
- A clear description of the issue
- Steps to reproduce the problem
- Expected vs actual behavior
- Environment details (OS, browser, Node.js version)

## Feature Requests

Feature requests are welcome! Please:
- Provide a clear description of the feature
- Explain the use case and benefits
- Consider if it fits the project's scope

## Code of Conduct

Please be respectful and professional in all interactions. We're here to learn and build together.

## Questions

If you have questions, feel free to:
- Open an issue for discussion
- Ask in the project discussions
- Reach out to the maintainers

Thank you for contributing! 🎉
