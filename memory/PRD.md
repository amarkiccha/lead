# Propz CRM - Leads Management System

## Original Problem Statement
Build a simple React web app connected only to Google Sheets using a Google Apps Script Web App API. Do not use MongoDB, FastAPI, or any traditional backend. This app is only for managing and displaying leads.

## Architecture
- **Frontend**: React with Tailwind CSS + Shadcn UI components
- **Backend**: Google Sheets via Google Apps Script API
- **Authentication**: Simple password-based auth stored in sessionStorage
- **No traditional database** - all data stored in Google Sheets

## User Personas
1. **Public User**: Anyone who wants to view leads in a read-only manner
2. **Admin User**: Authorized personnel who can add new leads and manage the system

## Core Requirements (Static)
1. Public Leads Page - View-only display of all leads
2. Admin Login - Password-protected access
3. Admin Dashboard - Leads management with add functionality
4. Date+Time sorting - Chronological order (latest first)
5. No MongoDB or FastAPI backend

## What's Been Implemented (Feb 25, 2026)
### Pages
- **Public Leads Page** (`/`): Displays all leads in a table with Name, Project Name, Phone Number, Date, Time columns
- **Admin Login Page** (`/admin/login`): Split-screen design with password authentication
- **Admin Dashboard** (`/admin/dashboard`): Stats cards, leads table, and Add Lead form

### Features
- [x] Google Sheets API integration via Apps Script
- [x] Date+Time descending sort (latest first)
- [x] Password authentication (Propz@2026)
- [x] Protected routes with session storage
- [x] Add Lead form with date/time pickers
- [x] Refresh functionality
- [x] Responsive design
- [x] Toast notifications (sonner)

### Design System
- **Primary Color**: Deep Maroon (#6E0901)
- **Background**: Warm Beige (#F5F5DC)
- **Typography**: Playfair Display (headings), Manrope (body)
- **Style**: "Old Money Modern" - sharp edges, professional

## API Integration
- **Endpoint**: Google Apps Script Web App
- **GET**: `?action=getLeads` - Fetches all leads
- **GET**: `?action=addLead&name=X&project=Y&phone=Z&date=D&time=T` - Adds new lead

## Prioritized Backlog

### P0 - Completed
- [x] Public Leads Display
- [x] Admin Authentication
- [x] Admin Dashboard
- [x] Add Lead Form

### P1 - Future Enhancements
- [ ] Edit Lead functionality
- [ ] Delete Lead functionality
- [ ] Search/filter leads
- [ ] Export leads to CSV

### P2 - Nice to Have
- [ ] Bulk import leads
- [ ] Lead status tracking
- [ ] Email notifications for new leads
- [ ] Analytics dashboard

## Next Tasks
1. User may want to test Add Lead functionality with actual submission
2. Consider adding edit/delete capabilities
3. Add search and filter functionality for larger datasets
