# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Asistec is a React Native application for scheduling and tracking technical services. The app targets technicians and administrators in the Bogotá, Colombia region, providing functionality for service management, customer relations, and real-time tracking.

**Core Features:**
- Authentication via Firebase Auth with phone number verification
- Service booking and tracking system
- Real-time messaging and notifications
- Google Maps integration for location services
- Multi-role support (Admin, Technicians, Customers)
- Firebase Firestore for data management
- Push notifications with FCM and Notifee

## Development Commands

### Installation & Setup
```bash
# Install dependencies
yarn install

# iOS specific setup (run in ios directory)
cd ios
bundle install
bundle exec pod install
# OR from root
npx pod-install ios

# Alternative pod install
npx pod-install ios --allow-root
```

### Running the Application
```bash
# Start Metro bundler
yarn start
# OR with cache reset
yarn start --reset-cache
npx react-native start --reset-cache

# Run on Android
yarn android
npx react-native run-android

# Run on iOS
yarn ios
npx react-native run-ios
```

### Building & Distribution
```bash
# Version management
yarn react-native-version --never-amend

# Android APK build
cd android && ./gradlew assembleRelease

# Android AAB build
npx react-native build-android --mode=release

# Android clean build
cd android && ./gradlew clean

# iOS build process (via Xcode)
# Product -> Clean build, Build, Archive - Window -> Organizer
# Distribute App -> App Store Connect
```

### Development Tools
```bash
# Linting
yarn lint

# Testing
yarn test

# Clear watchman cache
watchman watch-del-all

# Generate signing report (Android)
cd android && ./gradlew signingReport
```

## Architecture & Code Structure

### State Management
The app uses a hybrid state management approach:
- **Redux Toolkit** (`src/redux/`) - Global app state, filters, and loader management
- **Pullstate** (`src/store/`) - User profile and authentication state
- **Firebase Realtime Listeners** - Reactive data updates for users and notifications

### Navigation Structure
- **Stack Navigator** - Main navigation container with authentication flow
- **Drawer Navigator** - Authenticated app navigation with role-based menu items
- **Modal Screens** - Service management, user management, and detailed views

### Firebase Integration
- **Authentication** - Phone number authentication with automatic user profile creation
- **Firestore Collections**:
  - `usuarios` - User profiles with role-based access (type: 1=Admin, 2=Tech, 3=Customer)
  - `services_order` - Service booking and tracking
  - `notifications_logs` - Push notification management
  - `chat_messages` - In-app messaging system
- **Cloud Functions** - Backend processing for notifications and data validation
- **Storage** - Media uploads for service documentation

### Key Configuration Files
- `core_app.config.js` - Central app configuration including API endpoints, service types, and business logic constants
- `src/app.config.js` - Additional app-specific settings
- `babel.config.js` - Includes module resolver with `@src` alias
- Path alias `@src` maps to `./src` directory

### Component Architecture
- **Core Components** (`src/components/`) - Reusable UI components with theme integration
- **Themed Components** - All components support the app's theming system
- **Hook-based Logic** - Custom hooks for app utilities and React Hook Form integration
- **Portal Integration** - React Native Paper portal system for modals and overlays

### Location Services
- Google Maps integration with directions and geocoding
- Real-time location tracking for technicians
- Service area management for Bogotá region

## Version Management Workflow

When updating versions:
1. Create feature branch for changes
2. Update `changelog.txt` with version details and changes
3. Update version in `core_app.config.js`
4. Update `package.json` version manually
5. Run `yarn react-native-version --never-amend`
6. For iOS: Open Xcode, update version and build number in Targets > Asistec > Identity
7. Clean build and test
8. Merge to main after validation

## Service Configuration

The app supports multiple service types defined in `core_app.config.js`:
- JARDINERIA (Gardening) - Prefix: J
- VIDRERIA (Glass work) - Prefix: V  
- GASNATURAL (Natural Gas) - Prefix: G
- PLOMERIA (Plumbing) - Prefix: P
- ELECTRICIDAD (Electricity) - Prefix: E

Each service type has specific configuration for images, prefixes, and workflow states.

## Development Notes

- Uses React Native 0.81.1 with new architecture disabled
- Minimum Node.js version: 20
- Bundle identifier: `com.asistecprod.asistecapp`
- Targets Colombian market with Spanish localization
- Firebase project configured for production environment
- Uses real backend API endpoints (not mock data)