# Open Referral UK

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/oruk-standard-and-website)

## Overview

Open Referral UK (ORUK) is a comprehensive web platform and ecosystem for the Open Referral UK data standard - an open standard that provides a consistent way to publish, find, and use community services data. This makes it easier for people to find what they need and supports connected local services across the UK.

### Purpose and Features

This platform serves multiple audiences:

- **Local Authorities**: Resources, templates, and guides to support adoption of the ORUK standard, including business case templates, project initiation documents, and benefits calculators
- **Developers**: Technical documentation, API specifications, validation tools, and developer resources for implementing ORUK-compliant systems
- **Service Providers**: Information about publishing service data in ORUK format and joining the verified feed directory
- **Community Members**: Access to case studies, forums, and collaborative tools for sharing knowledge and best practices

**Key Features:**

- **API Documentation**: Complete OpenAPI specifications for ORUK data standard versions (1.0, 3.0)
- **Validator Tool**: Real-time validation of ORUK API feeds for compliance checking with detailed error reporting
- **Dashboard**: Live monitoring of verified feed availability and health status with service tables
- **Data Model Explorer**: Interactive documentation of the ORUK schema with JSON visualization
- **Content Management**: Markdown-based content system with YAML frontmatter support and dynamic routing
- **Case Studies**: Real-world implementation examples from councils and organizations across the UK
- **Service Registration**: Integrated GitHub issue creation workflow for new service feed registration
- **Accessibility**: Built-in accessibility features with Axe-core testing integration
- **Analytics**: Vercel Analytics for performance monitoring and usage insights
- **Cookie Management**: Compliant cookie consent and management system

## Technical Architecture

### Technology Stack

This is a modern Next.js 16 application built with:

- **Framework**: Next.js 16.1.6 with App Router and Server Components
- **Runtime**: React 19.2.4 with enhanced server-side rendering
- **Language**: TypeScript 5.9 with strict type checking and enhanced compiler options
- **Styling**: CSS Modules for component-scoped styles
- **Database**: MongoDB 7.0 for service feed tracking and dashboard data
- **Schema Validation**: Zod 4.3.6 for runtime type safety and data validation
- **Testing**: Jest 30 for unit tests, Playwright 1.58 for end-to-end testing with accessibility checks
- **Deployment**: Vercel with continuous deployment and analytics
- **Code Quality**: ESLint 9, Prettier 3.8, Husky for Git hooks, and lint-staged for pre-commit checks
- **Integrations**: GitHub API via Octokit for issue tracking and workflow automation

> **📖 Full Technical Documentation**: For comprehensive architecture details, development guides, and implementation documentation, visit the [project wiki](https://github.com/tpximpact/oruk-standard-and-website/wiki).

### Architecture Components

#### Frontend

- **Server Components**: Leverages Next.js 16 server components with experimental HMR cache disabled for optimal development
- **Dynamic Routing**: File-based routing with dynamic segments for content pages and automatic redirects
- **Markdown Processing**: Custom markdown rendering with `gray-matter` for YAML frontmatter and `marked` 17.0 for parsing
- **Component Library**: Extensive library of 50+ reusable React components including:
  - Documentation components (APIModel, OpenAPIModel, VersionedDocumentation)
  - Data visualization (Dashboard, DashboardTable, ServicesTable, PaginatedTable, SortedAndPaginatedTable)
  - Form components (ValidatorForm, ValidatorResult, Register)
  - Navigation (Header, Menu, Crumbtrail, InPageMenu)
  - UI elements (Button, Badge, Banner, Icon, Spinner)
  - Content display (ContentHTML, GenericPage, NamedMarkdownPage, PageList)
- **Image Optimization**: Next.js image optimization with AVIF and WebP support
- **Responsive Design**: Mobile-first design with device-specific image sizes

#### Backend Services

- **MongoDB Integration**: Service repository pattern for data access with Zod 4.3 schema validation and type safety
- **API Proxy**: Server-side proxy for external API validation and dashboard data fetching
- **Server Actions**: Next.js server actions for form handling, data mutations, and service validation
- **Content Loading**: Dynamic content loading from filesystem with versioning support and JSON metadata
- **GitHub Integration**: Octokit-based integration for automated issue creation and repository management
- **Caching**: HTTP headers configuration for static asset caching and specification files
- **Environment Configuration**: Feature flags for cookies, navigation, and warranty notices

#### Developer Tools

- **Validator**: POST endpoint integration with external validation service for ORUK API compliance
- **Dashboard**: Real-time monitoring of registered service feeds with status tracking, health checks, and service tables
- **API Explorer**: Interactive API documentation with request/response examples and JSON viewer
- **Schema Browser**: Navigable data model documentation with relationship visualization
- **Type Safety**: Strict TypeScript configuration with noUncheckedIndexedAccess and noImplicitReturns
- **Hot Reload**: Fast refresh in development with Next.js HMR
- **Testing Infrastructure**: Comprehensive test setup with Jest and Playwright including accessibility testing

#### Key Directories

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── lib/             # MongoDB client and utilities
├── models/          # Zod schemas for data validation
├── repositories/    # Data access layer
├── specifications/  # OpenAPI specs for different versions
├── utilities/       # Helper functions and utilities
└── e2e/             # Playwright end-to-end tests

content/             # Markdown content files
├── about/           # About pages
├── adopt/           # Council adoption resources
├── case-studies/    # Implementation case studies
├── community/       # Community information
├── developers/      # Technical documentation
└── info/            # Site information pages
```

## Community and Contribution

Open Referral UK is built on the foundation of the international [Open Referral](https://openreferral.org/) initiative and the Human Services Data Specification (HSDS).

### Get Involved

- **Community Forum**: Join discussions, ask questions, and share insights at [forum.openreferraluk.org](https://forum.openreferraluk.org/)
- **International Forum**: Participate in global Open Referral discussions at [forum.openreferral.org](https://forum.openreferral.org/)
- **GitHub Issues**: Report bugs, request features, and discuss technical matters on our [GitHub issue tracker](https://github.com/OpenReferralUK/human-services/issues)
- **Code Repository**: Contribute to the codebase via our public repositories:
  - [Frontend Repository](https://github.com/tpximpact/oruk-standard-and-website)
  - [API Repository](https://github.com/tpximpact/OpenReferralApi)

### Attribution

This project builds upon the excellent work of the international [Open Referral community](https://openreferral.org/) and the Human Services Data Specification (HSDS). We acknowledge and thank all contributors to the global Open Referral initiative.

Our preferred form of attribution is: _"Human Services Data Specification UK: an Open Referral UK resource (https://openreferraluk.org/)"_

The standard originates with and the Open Referral UK project is built upon the international Human Services Data Specification: an Open Referral resource (https://openreferral.org/)

## License

This project uses dual licensing:

### Content and Documentation

The Human Services Data Specification UK (HSDS-UK) and associated documentation are licensed under the **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)** license.

- Full license text: https://creativecommons.org/licenses/by-sa/4.0/
- See [LICENSE](LICENSE) file for complete terms

Unless otherwise stated, contributions are copyright of the Open Referral UK project.

### Source Code

The application source code in this repository is available under the **BSD 3-Clause License** terms. This allows you to:

- Use the code commercially
- Modify and distribute
- Use privately
- Include in proprietary software (with attribution)

See the repository license file for full BSD 3-Clause terms.

## Development

### Getting Started

#### Prerequisites

- Node.js 20+ (LTS recommended)
- Yarn package manager
- MongoDB 7.0+ (local or remote instance)
- Git

#### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/tpximpact/oruk-standard-and-website.git
   cd oruk-standard-and-website
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration (see Environment Variables section below)

4. **Start MongoDB** (if running locally)

   ```bash
   mongod --dbpath /path/to/your/data/directory
   ```

5. **Run development server**

   ```bash
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

#### Development Workflow

The project uses Husky and lint-staged for pre-commit hooks to ensure code quality. On commit:

- ESLint checks and fixes code issues
- Prettier formats code
- TypeScript type checking runs
- Tests run (if configured)

To manually validate before committing:

```bash
yarn validate
```

### Available Scripts

- `yarn dev` - Start development server with Node.js webstorage disabled
- `yarn dev:ci` - Start development server for CI environments
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn test` - Run Jest unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:ci` - Run tests in CI mode
- `yarn test:coverage` - Run tests with coverage reports
- `yarn e2e` - Run Playwright end-to-end tests
- `yarn lint` - Lint and fix code with ESLint
- `yarn lint:check` - Check code without fixing
- `yarn type-check` - Run TypeScript type checking without emitting files
- `yarn validate` - Run all checks (lint, type-check, and tests)
- `yarn tidy` - Format code with Prettier
- `yarn upd` - Update content frontmatter metadata
- `yarn prepare` - Set up Husky Git hooks

### Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

**Database Configuration:**

- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017)
- `MONGODB_DB` - MongoDB database name (default: oruk_dev)

**External Service Endpoints:**

- `OPENAPI_VALIDATOR_ENDPOINT` - OpenAPI validator service endpoint
- `VALIDATOR_ENDPOINT` - ORUK feed validator service endpoint
- `REGISTER_ENDPOINT` - Service registration endpoint
- `DASHBOARD_DETAILS_ENDPOINT` - Dashboard data service endpoint

**GitHub Integration (for service registration):**

- `GITHUB_CLIENT_ID` - GitHub App client ID
- `GITHUB_APP_PRIVATE_KEY` - GitHub App private key (PEM format)
- `GITHUB_INSTALLATION_ID` - GitHub App installation ID
- `GITHUB_REPO_OWNER` - Repository owner/organization
- `GITHUB_REPO_NAME` - Repository name for issue creation
- `GITHUB_ISSUE_ASSIGNEES` - Comma-separated list of issue assignees

**Feature Flags:**

- `USE_COOKIES` - Enable cookie consent banner (default: true)
- `USE_NAV` - Enable navigation components (default: true)
- `USE_NOWARRANTY` - Display no warranty notice (default: true)

**Application Configuration:**

- `NEXTAUTH_URL` - Application base URL (default: http://localhost:3000)
- `NODE_ENV` - Environment mode (development/production/test)
- `LOG_LEVEL` - Logging level (info/debug/error)

## Documentation

For comprehensive technical documentation, including detailed architecture, testing guides, content management, and development workflows, visit:

**📖 [Project Wiki](https://github.com/tpximpact/oruk-standard-and-website/wiki)**

Key documentation sections:

- [Architecture](https://github.com/tpximpact/oruk-standard-and-website/wiki) - Technical architecture and system design
- [Managing Content](https://github.com/tpximpact/oruk-standard-and-website/wiki/Managing-Content) - Content authoring and management
- [Testing](https://github.com/tpximpact/oruk-standard-and-website/wiki/Testing) - Testing strategies and guidelines
- [GitHub Integration](https://github.com/tpximpact/oruk-standard-and-website/wiki/GitHub-Issue-Creation-for-Service-Verification) - Service verification workflow
