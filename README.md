# MobiAzores Fleet Management System

A comprehensive fleet management solution built with Next.js, React, and Supabase, designed specifically for MobiAzores to efficiently manage their vehicle fleet operations.

## 🚀 Project Overview

MobiAzores Fleet Management System is a modern, full-stack web application that provides complete fleet management capabilities including vehicle tracking, driver management, fuel monitoring, maintenance scheduling, and advanced analytics. The system is designed to streamline fleet operations and provide actionable insights for better decision-making.

## ✨ Key Features

### 🚗 Vehicle Management
- **Vehicle Registration & Tracking**: Complete vehicle lifecycle management
- **Fleet Status Monitoring**: Real-time tracking of vehicle status (active, maintenance, inactive)
- **Vehicle Information Management**: Detailed vehicle profiles with specifications and documentation
- **CRUD Operations**: Full create, read, update, delete functionality for vehicle records

### 👥 Driver Management
- **Driver Profiles**: Comprehensive driver information and documentation
- **Assignment Tracking**: Vehicle-driver relationship management
- **Driver Performance Monitoring**: Track driver-related metrics and performance

### ⛽ Fuel Management
- **Manual Refuel Entry**: Easy-to-use forms for recording fuel transactions
- **Fuel Consumption Analytics**: Detailed analysis of fuel usage patterns
- **Cost Tracking**: Monitor fuel expenses and trends
- **Export Functionality**: Generate reports and export fuel data
- **Vehicle-Specific Statistics**: Individual vehicle fuel performance metrics

### 🔧 Maintenance System
- **Maintenance Scheduling**: Plan and schedule maintenance activities
- **Calendar Integration**: Visual calendar view for maintenance planning
- **Category Management**: Organize maintenance by type and priority
- **Alert System**: Automated notifications for upcoming maintenance
- **History Tracking**: Complete maintenance record keeping
- **Analytics Dashboard**: Maintenance cost and frequency analysis

### 📊 Advanced Analytics & Reporting
- **Interactive Dashboard**: Real-time fleet overview with key metrics
- **Fuel Analytics**: Comprehensive fuel consumption analysis with trends
- **Maintenance Analytics**: Maintenance cost analysis and scheduling insights
- **Fleet Performance Metrics**: Overall fleet utilization and efficiency metrics
- **Cost Analysis**: Detailed financial reporting and cost breakdowns
- **Vehicle Utilization Tracking**: Monitor vehicle usage patterns
- **Custom Date Range Filtering**: Flexible reporting periods
- **Export Capabilities**: Generate and export various reports

### 🏢 Organizational Management
- **Department Management**: Organize fleet by departments
- **Location Tracking**: Manage multiple locations and facilities
- **Assignment Management**: Track vehicle assignments and allocations
- **User Role Management**: Secure access control and permissions

### 📈 Dashboard Features
- **Real-Time Overview**: Live fleet status and key performance indicators
- **Recent Activity Feed**: Track latest fleet activities and transactions
- **Upcoming Maintenance Alerts**: Proactive maintenance notifications
- **Fleet Status Visualization**: Visual representation of fleet health
- **Interactive Charts**: Dynamic data visualization with filtering options
- **Performance Metrics**: Key performance indicators and trends

### 🛠 Additional Capabilities
- **CSV Import**: Bulk data import functionality for easy migration
- **Multi-Language Support**: Internationalization (i18n) ready
- **Settings Management**: Customizable system configuration
- **User Authentication**: Secure login and user management
- **Responsive Design**: Mobile-friendly interface
- **Export System**: Generate various reports and data exports
- **Alert & Notification System**: Automated alerts for important events

## 🏗 Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **Components**: Radix UI primitives with shadcn/ui
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icons
- **Fonts**: Inter (sans-serif) and JetBrains Mono (monospace)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email/password
- **API**: Next.js API routes with server actions
- **Real-time**: Supabase real-time subscriptions
- **File Storage**: Supabase Storage for documents and images

### Development Tools
- **Language**: TypeScript for type safety
- **Package Manager**: Bun for fast package management
- **Linting**: ESLint with Next.js configuration
- **Deployment**: Vercel with automatic deployments
- **Analytics**: Vercel Analytics integration

## 📋 Database Schema

The system uses a comprehensive database schema with the following main entities:

- **vehicles**: Vehicle information and specifications
- **drivers**: Driver profiles and information
- **refuel_records**: Fuel transaction records
- **maintenance_schedules**: Maintenance planning and scheduling
- **locations**: Facility and location management
- **departments**: Organizational department structure
- **assignments**: Vehicle-driver-department assignments
- **users**: User authentication and profiles

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account and project
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd mobiazores-fleet
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   bun install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file with your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   bun dev
   \`\`\`

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Database Setup

The application includes SQL scripts in the `/scripts` folder for database initialization:
- Table creation scripts
- Initial data seeding
- Database migrations

## 📱 Usage

### Authentication
- Sign up for a new account or log in with existing credentials
- Access is controlled through Supabase authentication

### Navigation
The application features a comprehensive sidebar navigation with access to:
- Dashboard (overview and analytics)
- Vehicle management
- Driver management
- Fuel tracking
- Maintenance scheduling
- Analytics and reporting
- Data import tools
- System settings

### Key Workflows

1. **Vehicle Registration**: Add new vehicles with complete specifications
2. **Fuel Recording**: Log fuel transactions manually or through import
3. **Maintenance Planning**: Schedule and track maintenance activities
4. **Analytics Review**: Monitor fleet performance through interactive dashboards
5. **Report Generation**: Export data and generate various reports

## 🔧 Configuration

### Settings Management
The application includes a comprehensive settings system for:
- Language preferences (i18n support)
- Display preferences
- Notification settings
- User preferences

### Customization
- Tailwind CSS configuration for design system customization
- Component theming through CSS custom properties
- Responsive breakpoints and layout customization

## 📊 Analytics & Reporting

The system provides extensive analytics capabilities:

### Dashboard Metrics
- Total fleet cost tracking
- Fuel consumption analysis
- Maintenance cost monitoring
- Vehicle utilization rates
- Performance trend analysis

### Interactive Features
- Date range filtering
- Department/location filtering
- Vehicle-specific analysis
- Export functionality
- Real-time data updates

## 🔒 Security

- **Authentication**: Secure user authentication through Supabase
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted data transmission and storage
- **API Security**: Protected API routes with authentication middleware

## 🌐 Deployment

The application is optimized for deployment on Vercel:

1. **Connect to Vercel**: Link your repository to Vercel
2. **Environment Variables**: Configure production environment variables
3. **Database**: Set up production Supabase instance
4. **Deploy**: Automatic deployments on git push

## 🤝 Contributing

This is a proprietary fleet management system for MobiAzores. For internal development:

1. Follow the established code style and conventions
2. Write comprehensive tests for new features
3. Update documentation for any changes
4. Follow the git workflow for feature branches

## 📄 License

This project is proprietary software developed for MobiAzores fleet management operations.

## 📞 Support

For technical support or questions about the fleet management system, please contact the development team or system administrators.

---

**MobiAzores Fleet Management System** - Streamlining fleet operations with modern technology and comprehensive analytics.
