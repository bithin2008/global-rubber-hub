# Loader Service Usage Guide

## Overview
The Loader Service provides a centralized way to manage loading states across the entire application. It eliminates the need for individual components to manage their own loader state.

## Files Created/Modified

### New Files:
- `src/app/services/loader.service.ts` - The loader service
- `src/app/shared/loader/loader.component.ts` - The shared loader component

### Modified Files:
- `src/app/app.component.ts` - Added loader component import
- `src/app/app.component.html` - Added `<app-loader></app-loader>` tag
- `src/app/account/account.page.ts` - Updated to use loader service
- `src/app/dashboard/dashboard.page.ts` - Updated to use loader service
- `src/app/item-list/item-list.page.ts` - Updated to use loader service

## How to Use

### 1. Import the LoaderService
```typescript
import { LoaderService } from '../services/loader.service';
```

### 2. Inject the Service in Constructor
```typescript
constructor(
  // ... other dependencies
  private loaderService: LoaderService
) { }
```

### 3. Use the Service Methods
```typescript
// Show loader
this.loaderService.show();

// Hide loader
this.loaderService.hide();

// Check if loader is currently showing
const isLoading = this.loaderService.isLoading();
```

### 4. Example Usage in API Calls
```typescript
getData() {
  this.loaderService.show();
  
  this.commonService.get('api/endpoint').subscribe(
    (response) => {
      this.loaderService.hide();
      // Handle success
    },
    (error) => {
      this.loaderService.hide();
      // Handle error
    }
  );
}
```

## Benefits

1. **Centralized Management**: All loader states are managed in one place
2. **Consistent UI**: All loaders look and behave the same across the app
3. **Reduced Code Duplication**: No need to repeat loader HTML in every component
4. **Easy Maintenance**: Changes to loader styling only need to be made in one place
5. **Better Performance**: Single loader component instead of multiple instances

## Migration Guide

### For Existing Components:

1. **Remove** the `enableLoader` property from your component
2. **Remove** the loader HTML from your template:
   ```html
   <!-- Remove this -->
   <div class="loader-overlay" *ngIf="enableLoader">
     <div class="loader-container">
       <img src="assets/img/ajax-loader.gif">
       <span class="ion-text-center"> Please wait</span>
     </div>
   </div>
   ```
3. **Import** and inject `LoaderService`
4. **Replace** `this.enableLoader = true` with `this.loaderService.show()`
5. **Replace** `this.enableLoader = false` with `this.loaderService.hide()`

## Notes

- The loader is now globally available and will show/hide based on the service state
- The loader component is automatically included in the app component
- All existing loader styling is preserved in the loader component
- The service uses RxJS BehaviorSubject for reactive state management
