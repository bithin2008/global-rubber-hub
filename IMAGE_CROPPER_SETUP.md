# Image Cropper Integration

## Overview
This document describes the image cropper functionality that has been integrated into the Global Rubber Hub application. The image cropper allows users to crop their images after capturing them with the camera or selecting them from the gallery, before uploading.

## Features
- **Post-capture cropping**: After taking a photo or selecting from gallery, users can crop the image
- **Aspect ratio control**: Maintains 1:1 aspect ratio for profile images and document uploads
- **Responsive design**: Works on both mobile and desktop devices
- **File size optimization**: Automatically checks and enforces 2MB file size limit
- **User-friendly interface**: Clean modal interface with cancel and confirm options

## Implementation Details

### Components Created
1. **ImageCropperModalComponent** (`src/app/components/image-cropper-modal/`)
   - Standalone Angular component
   - Uses ngx-image-cropper library
   - Handles image loading, cropping, and file conversion

### Integration Points
1. **Profile Page** (`src/app/profile/profile.page.ts`)
   - Profile image upload now includes cropping step
   - Document upload for ID proof also includes cropping
   - Both camera and gallery sources are supported

### Key Methods Added
- `openImageCropper()`: Opens cropper modal for profile images
- `openImageCropperForUpload()`: Opens cropper modal for document uploads
- `processCroppedImage()`: Handles cropped profile image upload
- `processCroppedImageForUpload()`: Handles cropped document upload

### Dependencies
- `ngx-image-cropper`: Main cropping library
- Angular standalone components
- Ionic modal system

## Usage Flow

### For Profile Images:
1. User taps camera or gallery button
2. Image is captured/selected
3. Image cropper modal opens automatically
4. User can crop the image to desired area
5. User confirms crop
6. Cropped image is uploaded to server

### For Document Uploads:
1. User taps camera, gallery, or browse button
2. Image is captured/selected
3. Image cropper modal opens automatically
4. User can crop the document image
5. User confirms crop
6. Cropped image is added to upload queue

## Technical Details

### File Size Management
- All images are checked for 2MB limit after cropping
- Automatic compression is applied if needed
- Clear error messages for oversized images

### Error Handling
- Graceful fallback if cropper fails to load
- User-friendly error messages
- Proper cleanup on cancellation

### Responsive Design
- Modal adapts to different screen sizes
- Optimized for mobile devices
- Touch-friendly controls

## CSS Styling
- Custom modal styling in `src/global.scss`
- Responsive breakpoints for different devices
- Consistent with app's design system

## Future Enhancements
- Support for different aspect ratios
- Multiple crop presets
- Advanced editing features
- Batch processing for multiple images

## Troubleshooting
- If cropper doesn't load, check network connectivity
- Ensure ngx-image-cropper is properly installed
- Verify image format compatibility
- Check browser console for errors
