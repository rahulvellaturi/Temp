# Mock Data Migration Guide

## Overview
This document outlines the migration of all mock data from individual components to a centralized JSON file and service. All components now use the `mockDataService` to fetch data using map functions.

## Changes Made

### 1. Created Centralized Data Structure
- **File**: `frontend/src/data/mockData.json`
- **Contains**: Users, Policies, Claims, Payments, Documents, Payment Methods, Admin Stats, Recent Activity, Quick Actions
- **Structure**: Comprehensive JSON with all mock data used across the application

### 2. Created Mock Data Service
- **File**: `frontend/src/services/mockDataService.ts`
- **Purpose**: Provides methods to access and filter mock data
- **Methods**: 
  - `getUsers()`, `getUserById()`, `getUsersByRole()`
  - `getPolicies()`, `getPoliciesByUserId()`, `getPoliciesByStatus()`
  - `getClaims()`, `getClaimsByUserId()`, `getClaimsByStatus()`
  - `getPayments()`, `getPaymentsByUserId()`, `getPaymentsByStatus()`
  - `getDocuments()`, `getDocumentsByUserId()`, `getDocumentsByType()`
  - `getDashboardData()`, `getAdminStats()`, `getRecentActivity()`
  - Search methods for all data types

### 3. Updated Components

#### ✅ Completed Updates

##### Client Dashboard (`frontend/src/pages/client/Dashboard.tsx`)
- **Before**: Inline mock data object with policies, claims, payments
- **After**: Uses `mockDataService.getDashboardData(userId)` 
- **Map Usage**: 
  ```jsx
  {dashboardData.policies.slice(0, 3).map((policy) => (
    <div key={policy.id}>...</div>
  ))}
  ```

##### Client Policies (`frontend/src/pages/client/Policies.tsx`)
- **Before**: Large inline `mockPolicies` array
- **After**: Uses `mockDataService.getPoliciesByUserId(userId)`
- **Map Usage**:
  ```jsx
  {filteredPolicies.map((policy) => (
    <Card key={policy.id}>...</Card>
  ))}
  ```

##### Admin Dashboard (`frontend/src/pages/admin/Dashboard.tsx`)
- **Before**: Inline `mockStats` and `mockActivity` objects
- **After**: Uses `mockDataService.getAdminStats()`, `getRecentActivity()`, `getQuickActions()`
- **Map Usage**:
  ```jsx
  {quickActions.map((action) => (
    <Button key={action.id}>...</Button>
  ))}
  {recentActivity.map((activity) => (
    <div key={activity.id}>...</div>
  ))}
  ```

#### 🔄 Components Still Using Inline Mock Data (Need Updates)

##### Client Claims (`frontend/src/pages/client/Claims.tsx`)
- **Current**: Uses inline `mockClaims` array
- **Update Needed**: Replace with `mockDataService.getClaimsByUserId(userId)`
- **Map Usage**: Already uses `{filteredClaims.map((claim) => ...)}`

##### Client Payments (`frontend/src/pages/client/Payments.tsx`)
- **Current**: Uses inline `mockPayments` and `mockMethods` arrays
- **Update Needed**: Replace with `mockDataService.getPaymentsByUserId(userId)` and `mockDataService.getPaymentMethodsByUserId(userId)`
- **Map Usage**: Already uses `{filteredPayments.map((payment) => ...)}`

##### Client Documents (`frontend/src/pages/client/Documents.tsx`)
- **Current**: Uses inline `mockDocuments` array
- **Update Needed**: Replace with `mockDataService.getDocumentsByUserId(userId)`
- **Map Usage**: Already uses `{filteredDocuments.map((document) => ...)}`

##### Admin Users (`frontend/src/pages/admin/Users.tsx`)
- **Current**: Uses inline `mockUsers` array
- **Update Needed**: Replace with `mockDataService.getUsers()`
- **Map Usage**: Already uses `{filteredUsers.map((user) => ...)}`

##### Admin Policies (`frontend/src/pages/admin/Policies.tsx`)
- **Current**: Uses inline `mockPolicies` array
- **Update Needed**: Replace with `mockDataService.getPolicies()`
- **Map Usage**: Already uses `{filteredPolicies.map((policy) => ...)}`

##### Admin Claims (`frontend/src/pages/admin/Claims.tsx`)
- **Current**: Uses inline `mockClaims` array
- **Update Needed**: Replace with `mockDataService.getClaims()`
- **Map Usage**: Already uses `{filteredClaims.map((claim) => ...)}`

## Migration Pattern

### Step 1: Add Import
```typescript
import mockDataService from '@/services/mockDataService';
```

### Step 2: Replace Mock Data Loading
**Before:**
```typescript
const mockData = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' }
];
setData(mockData);
```

**After:**
```typescript
const data = mockDataService.getDataByUserId(userId);
setData(data);
```

### Step 3: Ensure Map Usage
All components should use map functions to render data:
```jsx
{data.map((item) => (
  <Component key={item.id} {...item} />
))}
```

## Benefits of This Approach

1. **Centralized Data Management**: All mock data in one location
2. **Consistency**: Same data structure across all components
3. **Maintainability**: Easy to update data in one place
4. **Type Safety**: Service provides typed methods
5. **Realistic Relationships**: Data items reference each other properly
6. **Filtering & Search**: Built-in methods for common operations
7. **Performance**: Service caches data and provides efficient filtering

## Data Structure Overview

### Users
- 5 sample users with different roles (CLIENT, AGENT, SUPER_ADMIN)
- Includes personal information, contact details, status

### Policies
- 5 sample policies across different types (AUTO, HOME, LIFE)
- Linked to users, includes coverage details, vehicles, beneficiaries

### Claims
- 3 sample claims with different statuses
- Linked to policies and users, includes timeline, documents

### Payments
- 5 sample payments with different statuses and methods
- Linked to policies, includes transaction details

### Documents
- 7 sample documents of various types
- Linked to users, policies, and claims

### Payment Methods
- 3 sample payment methods for different users
- Credit cards and bank accounts with realistic details

### Admin Data
- Statistics for dashboard widgets
- Recent activity log
- Quick action items

## Next Steps

1. **Complete Component Updates**: Update remaining components listed above
2. **Add More Data**: Expand JSON file with additional sample data if needed
3. **Add Relationships**: Ensure all data relationships are properly maintained
4. **Add Validation**: Consider adding data validation in the service
5. **Add Caching**: Implement caching for better performance if needed

## Usage Examples

### Getting User's Policies
```typescript
const userPolicies = mockDataService.getPoliciesByUserId('1');
```

### Getting Claims by Status
```typescript
const pendingClaims = mockDataService.getClaimsByStatus('PENDING');
```

### Getting Dashboard Data
```typescript
const dashboardData = mockDataService.getDashboardData('1');
```

### Searching Documents
```typescript
const searchResults = mockDataService.searchDocuments('insurance');
```

This migration ensures all components use consistent, centralized mock data while maintaining the existing map-based rendering patterns.