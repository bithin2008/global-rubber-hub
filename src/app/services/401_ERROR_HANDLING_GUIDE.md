# 401 Error Handling Guide

This guide explains how the new global 401 error handling system works in your Angular application.

## Overview

The system automatically handles 401 (Unauthorized) errors and logs out users when their authentication token becomes invalid.

## How It Works

### 1. HTTP Interceptor
- **File**: `src/app/interceptors/auth.interceptor.ts`
- **Purpose**: Intercepts all HTTP requests and responses
- **Action**: Automatically detects 401 errors and triggers logout

### 2. AuthGuardService
- **File**: `src/app/services/auth-guard.service.ts`
- **Purpose**: Central service for authentication management
- **Features**:
  - Token validation
  - Automatic logout on 401 errors
  - Toast notifications
  - Navigation to login page

### 3. CommonService Integration
- **File**: `src/app/services/common-service.ts`
- **Purpose**: Enhanced error handling in HTTP methods
- **Action**: Additional 401 error detection in service methods (backup/redundancy)

## Automatic 401 Handling

### What Happens When a 401 Error Occurs:

1. **HTTP Interceptor Detects 401**: All HTTP responses are monitored
2. **AuthGuardService is Called**: `handle401Error()` method is invoked
3. **User is Logged Out**: 
   - All localStorage is cleared
   - Authentication status is updated
   - Toast notification is shown
   - User is redirected to login page

### Example Flow:
```
API Request → 401 Response → Interceptor → AuthGuardService → Logout → Login Page
```

## Usage Examples

### Option 1: Extend BaseAuthComponent (Recommended)

```typescript
import { Component } from '@angular/core';
import { BaseAuthComponent } from '../shared/base-auth.component';
import { AuthGuardService } from '../services/auth-guard.service';

@Component({
  selector: 'app-my-component',
  template: '<div>My Component</div>'
})
export class MyComponent extends BaseAuthComponent {
  
  constructor(authGuardService: AuthGuardService) {
    super(authGuardService);
  }

  // Override these methods to handle authentication events
  protected override onAuthenticationSuccess(): void {
    console.log('User is authenticated, loading data...');
    this.loadMyData();
  }

  protected override onAuthenticationFailed(): void {
    console.log('User is not authenticated');
    // Base component will handle logout automatically
  }

  private loadMyData(): void {
    // Your data loading logic here
  }
}
```

### Option 2: Manual Authentication Check

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthGuardService } from '../services/auth-guard.service';

@Component({
  selector: 'app-my-component',
  template: '<div>My Component</div>'
})
export class MyComponent implements OnInit {
  
  constructor(private authGuardService: AuthGuardService) {}

  async ngOnInit(): Promise<void> {
    // Check authentication on component initialization
    const isAuthenticated = await this.authGuardService.checkTokenAndAuthenticate();
    
    if (isAuthenticated) {
      // User is authenticated, proceed with component logic
      this.loadMyData();
    }
    // If not authenticated, user will be automatically logged out
  }

  private loadMyData(): void {
    // Your data loading logic here
  }
}
```

### Option 3: Manual 401 Error Handling

```typescript
// In any service or component
this.commonService.get('api/endpoint').subscribe(
  (response) => {
    // Handle success
  },
  (error) => {
    if (error.status === 401) {
      // This will be handled automatically by the interceptor
      // But you can also handle it manually if needed
      this.authGuardService.handle401Error('Custom message');
    }
  }
);
```

## Benefits

- ✅ **Automatic Handling**: No need to manually check for 401 errors in each component
- ✅ **Consistent Behavior**: All 401 errors are handled the same way across the app
- ✅ **User Experience**: Users are automatically logged out and redirected to login
- ✅ **Toast Notifications**: Users get clear feedback about what happened
- ✅ **Clean Code**: Reduces boilerplate code in components

## Configuration

### Interceptor Registration
The interceptor is automatically registered in `src/main.ts`:

```typescript
provideHttpClient(
  withInterceptors([AuthInterceptor])
)
```

### Custom Messages
You can customize logout messages:

```typescript
// In AuthGuardService
await this.logoutUser('Custom logout message');

// Or handle 401 with custom message
await this.handle401Error('Session expired. Please login again');
```

## Testing

### Simulate 401 Error
To test the system, you can:

1. **Invalidate Token**: Clear or modify the token in localStorage
2. **Backend Response**: Have your backend return a 401 status
3. **Network Tab**: Check browser network tab for 401 responses

### Expected Behavior
- User should be automatically logged out
- Toast notification should appear
- User should be redirected to login page
- All localStorage should be cleared

## Troubleshooting

### Common Issues

1. **Interceptor Not Working**:
   - Check if interceptor is properly registered in `main.ts`
   - Verify AuthGuardService is provided in 'root'

2. **Toast Not Showing**:
   - Check if ToastModalComponent is available
   - Verify modal controller is working

3. **Navigation Not Working**:
   - Check if Router is properly injected
   - Verify route paths are correct

### Debug Mode
Enable debug logging by checking browser console for:
- "401 error intercepted, handling authentication failure"
- "Handling 401 error - logging out user"
- "Token verification failed"

## Migration Guide

### For Existing Components

1. **Add AuthGuardService**:
   ```typescript
   constructor(private authGuardService: AuthGuardService) {}
   ```

2. **Extend BaseAuthComponent** (recommended):
   ```typescript
   export class MyComponent extends BaseAuthComponent {
     constructor(authGuardService: AuthGuardService) {
       super(authGuardService);
     }
   }
   ```

3. **Remove Manual 401 Handling**:
   - Remove manual 401 error checks
   - Remove manual logout logic
   - Let the interceptor handle everything

### For Services

1. **Remove Manual 401 Handling**:
   ```typescript
   // Remove this
   if (error.status === 401) {
     localStorage.clear();
     this.router.navigate(['/login']);
   }
   ```

2. **Let Interceptor Handle It**:
   - The interceptor will automatically handle 401 errors
   - No additional code needed

## Best Practices

1. **Always Extend BaseAuthComponent** for protected components
2. **Don't Handle 401 Manually** - let the interceptor do it
3. **Use Custom Messages** when appropriate
4. **Test Authentication Flow** regularly
5. **Monitor Console Logs** for debugging

## Files Modified

- `src/app/interceptors/auth.interceptor.ts` - New HTTP interceptor
- `src/app/services/auth-guard.service.ts` - Enhanced authentication service (uses HttpClient directly)
- `src/app/services/common-service.ts` - Added 401 error handling (backup)
- `src/main.ts` - Registered HTTP interceptor
- `src/app/dashboard/dashboard.page.ts` - Example implementation
