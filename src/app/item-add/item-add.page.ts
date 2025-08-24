import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthGuardService } from '../services/auth-guard.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonRadioGroup,
  IonRadio,
  IonTextarea,
  IonIcon,
  IonLoading,
  IonToast,
  IonSpinner,
  ModalController,
  ToastController,
  ActionSheetController,
  Platform
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CommonService } from '../services/common-service';
import { ToastService } from '../services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PageTitleService } from '../services/page-title.service';
import { ImageCropperModalComponent } from '../components/image-cropper-modal/image-cropper-modal.component';

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.page.html',
  styleUrls: ['./item-add.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonTextarea,
    IonIcon,
    IonLoading,
    IonToast,
    IonSpinner,
    HeaderComponent,
    FooterComponent
  ]
})
export class ItemAddPage implements OnInit, AfterViewInit {
  itemForm!: FormGroup;
  selectedImages: any[] = [];
  selectedVideo: any = null;
  isSubmitting = false;
  submitted = false;
  enableLoader = false;
  profileDetails: any = {};
  isEditMode = false;
  itemId: any;
  private isDeviceReady: boolean = false;
  
  // Enhanced camera properties
  public showCameraInterface: boolean = false;
  public cameraStream: MediaStream | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toastService: ToastService,
    private router: Router,
    public modalController: ModalController,
    private pageTitleService: PageTitleService,
    private authGuardService: AuthGuardService,
    private activatedRoute: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.isDeviceReady = true;
    });
  }

  async ngOnInit() {
    // Check authentication on component initialization
    await this.authGuardService.checkTokenAndAuthenticate();
    
    // Check if we're in edit mode
    this.activatedRoute.queryParams.subscribe(params => {
      this.itemId = params['id'];
      if (this.itemId) {
        this.isEditMode = true;
        this.pageTitleService.setPageTitle('Edit Item');
        this.loadItemForEdit(this.itemId);
      } else {
        this.isEditMode = false;
        this.pageTitleService.setPageTitle('Add Item');
      }
    });
    
    this.initForm();
  }

  ngAfterViewInit() {
    // Ensure form is initialized after view is ready
    if (!this.itemForm) {
      this.initForm();
    }
    
    // Add a small delay to ensure the form is properly bound
    setTimeout(() => {
      console.log('After view init - UOM value:', this.itemForm?.get('uom_id')?.value);
      console.log('Form valid:', this.itemForm?.valid);
    }, 100);
  }

  initForm() {
    try {
      this.itemForm = this.formBuilder.group({
        id: ['', []], // Empty for adding new item
        item_name: ['', [Validators.required, Validators.maxLength(60)]],
        hsn_code: ['', [Validators.required, Validators.maxLength(8), Validators.pattern(/^\d+$/)]],
        item_listed_for: [1, Validators.required],
        uom_id: [2, Validators.required], // Changed to number type
        description: ['', [Validators.maxLength(255)]],
        price: ['', [Validators.required, Validators.min(0.01)]],
        quantity: ['', [Validators.required, Validators.min(0.01)]]
      });
      console.log('Form initialized successfully:', this.itemForm);
      console.log('UOM ID value:', this.itemForm.get('uom_id')?.value);
    } catch (error) {
      console.error('Error initializing form:', error);
    }
  }

  getProfileData() {
    this.enableLoader = true;
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.profileDetails = response.user;
        } else {
          this.showToast('error', response.message, '', 3500, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );
  }

  loadItemForEdit(itemId: number) {
    this.isEditMode = true;
    this.enableLoader = true;
    let url = `items/details`;
    this.commonService.post(url, {id: itemId,module:1}).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          const item = response.results;
          // Populate the form with item data
          this.itemForm.patchValue({
            id: item.id,
            item_name: item.item_name,
            hsn_code: item.hsn_code,
            item_listed_for: item.item_listed_for,
            uom_id: parseInt(item.uom_id) || 2, // Convert to number and provide fallback
            description: item.description,
            price: item.price,
            quantity: item.quantity
          });
          console.log('Form patched with UOM ID:', this.itemForm.get('uom_id')?.value);
          
          // Load existing images if any
          if (item.item_image && item.item_image.length > 0) {
            this.selectedImages = item.item_image.map((img: any) => ({
              preview: img,
              file: null // We don't have the actual file for existing images
            }));
          }
          
         // Load existing video if any
          if (item.video) {
            this.selectedVideo = {
              preview: item.video,
              file: null // We don't have the actual file for existing video
            };
          }
        } else {
          this.showToast('error', response.message, '', 3500, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error loading item:', error);
        this.showToast('error', 'Failed to load item details', '', 3500, '');
      }
    );
  }

  get f() { 
    return this.itemForm ? this.itemForm.controls : {}; 
  }



  onVideoChange(event: any) {
    const file = event.target.files[0];
    console.log('Video change event:', file);
    if (file) {
      console.log('Processing video file:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        this.showToast('danger', 'Please select only video files', '', 2500, '/login');
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        this.showToast('danger', 'Video size should be less than 100MB', '', 2500, '/login');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedVideo = {
          file: file,
          preview: e.target.result
        };
        console.log('Video added to selectedVideo');
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  previewImage(imageSrc: string) {
    // Open image in new tab for full preview
    window.open(imageSrc, '_blank');
  }

  removeVideo() {
    this.selectedVideo = null;
  }

  // Camera functionality methods
  async openCamera() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source (Max 2MB)',
      subHeader: 'Images larger than 2MB will be automatically rejected',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.takePicture('camera');
          }
        },
        {
          text: 'Photo Library',
          icon: 'images',
          handler: () => {
            this.takePicture('library');
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private checkCameraAvailability(): boolean {
    // Check if we're on a mobile device or web with camera support
    if (!this.platform.is('mobile') && !this.platform.is('pwa')) {
      console.log('Camera check: Not on mobile device or PWA');
      return false;
    }
    
    // Check if Capacitor Camera plugin is available
    if (!Camera) {
      console.log('Camera check: Capacitor Camera plugin not available');
      return false;
    }
    
    console.log('Camera check: Capacitor Camera is available');
    return true;
  }

  async takePicture(source: string) {
    try {
      console.log('takePicture called with source:', source);
      
      // Check if native camera is available
      if (this.checkCameraAvailability()) {
        try {
          await this.useNativeCamera(source);
        } catch (cameraError) {
          console.error('Native camera failed, falling back to file input:', cameraError);
          this.openFileInputWithSource(source);
        }
      } else {
        // Fallback to file input for web, desktop, or when camera is not available
        console.log('Native camera not available, using file input');
        this.openFileInputWithSource(source);
      }
      
    } catch (error: any) {
      console.error('Image selection error:', error);
      this.showToast('error', 'Failed to select image. Please try again.', '', 4000, '');
    }
  }

  private async useNativeCamera(source: string): Promise<void> {
    try {
      console.log('Attempting to use Capacitor camera for source:', source);
      
      // Check if camera is available
      if (!Camera) {
        console.log('Capacitor Camera plugin not available, falling back to file input');
        this.openFileInputWithSource(source);
        return;
      }

      const cameraSource = source === 'camera' ? CameraSource.Camera : CameraSource.Photos;
      
      console.log('Using Capacitor camera with source:', cameraSource);
      
      const image = await Camera.getPhoto({
        quality: 70, // Reduced quality to help stay under 2MB
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: cameraSource,
        width: 1200, // Optimized for 2MB limit
        height: 1200, // Optimized for 2MB limit
        correctOrientation: true,
        // Add viewfinder border options for camera
        ...(source === 'camera' && {
          // These options help create a viewfinder-like experience
          presentationStyle: 'popover',
          // Set aspect ratio to create viewfinder border effect
          aspectRatio: '1:1'
        })
      });
      
      console.log('Camera returned image:', image);
      console.log('Image webPath:', image.webPath);
      console.log('Image path:', image.path);
      
      if (image.webPath) {
        // Show image cropper modal
        await this.openImageCropper(image.webPath);
      } else {
        this.showToast('error', 'No image selected', '', 3000, '');
      }
    } catch (error: any) {
      console.error('Capacitor camera error:', error);
      
      // Handle specific camera errors
      if (error.message && error.message.includes('cancelled')) {
        console.log('User cancelled image selection');
        return;
      }
      
      // Handle permission errors
      if (error.message && (error.message.includes('permission') || error.message.includes('Permission'))) {
        this.showToast('error', 'Camera permission is required. Please enable camera access in your device settings.', '', 5000, '');
        return;
      }
      
      // Handle hardware errors
      if (error.message && (error.message.includes('hardware') || error.message.includes('Hardware'))) {
        this.showToast('error', 'Camera hardware not available. Please try selecting from gallery instead.', '', 4000, '');
        this.openFileInputWithSource('library');
        return;
      }
      
      // Fallback to file input if native camera fails
      console.log('Falling back to file input due to camera error');
      this.openFileInputWithSource(source);
      this.enableLoader = false;
    }
  }

  private openFileInputWithSource(source: string): void {
    // Create a hidden file input with camera capture support
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.multiple = true; // Allow multiple selection for images
    
    // Set capture attribute for camera on mobile devices
    if (source === 'camera') {
      fileInput.setAttribute('capture', 'camera');
    }
    
    fileInput.addEventListener('change', async (event: any) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        // For single image selection, show cropper
        if (files.length === 1) {
          const file = files[0];
          const imageUrl = URL.createObjectURL(file);
          await this.openImageCropper(imageUrl);
        } else {
          // For multiple files, process normally
          this.processFiles(files);
        }
      }
      document.body.removeChild(fileInput);
    });
    
    fileInput.addEventListener('cancel', () => {
      console.log('File selection cancelled');
      document.body.removeChild(fileInput);
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
  }

  private async checkImageSizeAndProcess(imageUri: string): Promise<void> {
    try {
      // Fetch the image to check its size
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      console.log('Image size before processing:', this.formatFileSize(blob.size));
      
      // Check if image is already under 2MB
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (blob.size > maxSize) {
        // Try to compress the image before rejecting
        const compressedImageUri = await this.compressImage(imageUri, blob.size);
        if (compressedImageUri) {
          console.log('Image compressed successfully');
          this.processImageURI(compressedImageUri);
        } else {
          this.showToast('error', `Image is too large (${this.formatFileSize(blob.size)}). Maximum size allowed is 2MB. Please try again with a smaller image or lower quality.`, '', 5000, '');
          this.enableLoader = false;
        }
        return;
      }
      
      // If size is acceptable, process the image
      this.processImageURI(imageUri);
      
    } catch (error) {
      console.error('Error checking image size:', error);
      this.enableLoader = false;
      // If we can't check the size, proceed with processing and let the existing size check handle it
      this.processImageURI(imageUri);
    }
  }

  private async openImageCropper(imageUri: string): Promise<void> {
    try {
      const modal = await this.modalController.create({
        component: ImageCropperModalComponent,
        componentProps: {
          imageUrl: imageUri,
          aspectRatio: 1, // 1:1 aspect ratio
          maintainAspectRatio: true,
          cropperTitle: 'Crop Item Image'
        },
        cssClass: 'image-cropper-modal'
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();
      
      if (data && data.cropped) {
        // Show loading indicator
        this.enableLoader = true;
        
        // Process the cropped image
        await this.processCroppedImage(data.file);
      } else {
        // User cancelled cropping, no action needed
        console.log('User cancelled image cropping');
      }
    } catch (error) {
      console.error('Error opening image cropper:', error);
      this.showToast('error', 'Failed to open image cropper', '', 4000, '');
    }
  }

  private async processCroppedImage(file: File): Promise<void> {
    try {
      console.log('Processing cropped image, size:', this.formatFileSize(file.size));
      
      // Check file size
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.showToast('error', `Image is too large (${this.formatFileSize(file.size)}). Maximum size allowed is 2MB.`, '', 5000, '');
        this.enableLoader = false;
        return;
      }
      
      // Create image object and add to selectedImages
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImages.push({
          file: file,
          preview: e.target.result
        });
        console.log('Cropped image added to selectedImages:', this.selectedImages.length);
        this.enableLoader = false;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing cropped image:', error);
      this.showToast('error', 'Failed to process cropped image', '', 4000, '');
      this.enableLoader = false;
    }
  }

  private async processImageURI(imageURI: string): Promise<void> {
    try {
      console.log('Processing image URI:', imageURI);
      
      // Convert file/content URI to a displayable path in WebView
      const displaySrc = (window as any).Ionic?.WebView?.convertFileSrc
        ? (window as any).Ionic.WebView.convertFileSrc(imageURI)
        : imageURI;
      
      console.log('Display source:', displaySrc);
      
      // Convert to PNG format using canvas for better compatibility
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Set crossOrigin to anonymous to handle CORS issues
      img.crossOrigin = 'anonymous';

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('Image load timeout');
        this.showToast('error', 'Image loading timed out. Please try again.', '', 4000, '');
        this.enableLoader = false;
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Clear canvas and draw image
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            console.log('PNG blob created, size:', pngBlob.size);
            
            // Check file size (2MB = 2 * 1024 * 1024 bytes)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (pngBlob.size > maxSize) {
              this.showToast('error', `Image is too large (${this.formatFileSize(pngBlob.size)}). Maximum size allowed is 2MB. Please try again with a smaller image.`, '', 4000, '');
              this.enableLoader = false;
              return;
            }

            const file = new File([pngBlob], `camera-image-${Date.now()}.png`, { type: 'image/png' });

            // Create image object and add to selectedImages
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.selectedImages.push({
                file: file,
                preview: e.target.result
              });
              console.log('Camera image added to selectedImages:', this.selectedImages.length);
              this.enableLoader = false;
            };
            reader.readAsDataURL(file);
          } else {
            console.error('Failed to create PNG blob');
            this.showToast('error', 'Failed to process image format. Please try again.', '', 4000, '');
            this.enableLoader = false;
          }
        }, 'image/png', 0.9); // Add quality parameter for better compression
      };

      img.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Error loading image:', error);
        console.error('Image source that failed:', displaySrc);
        
        // Check if this is a camera image (file:// URI)
        if (imageURI.startsWith('file://') || imageURI.startsWith('content://')) {
          console.log('Detected camera image, trying alternative processing');
          this.handleImageLoadError(imageURI);
        } else {
          // For other types of images, show generic error
          this.showToast('error', 'Failed to process image. Please try again.', '', 4000, '');
          this.enableLoader = false;
        }
      };

      img.src = displaySrc;
      
    } catch (error: any) {
      console.error('Image processing error:', error);
      this.showToast('error', 'Failed to process image. Please try again.', '', 4000, '');
      this.enableLoader = false;
    }
  }

  private processFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Processing file:', file.name, file.type, file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showToast('error', 'Please select only image files', '', 2500, '');
        continue;
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        this.showToast('error', `Image ${file.name} is too large (${this.formatFileSize(file.size)}). Maximum size allowed is 2MB.`, '', 4000, '');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImages.push({
          file: file,
          preview: e.target.result
        });
        console.log('Image added to selectedImages:', this.selectedImages.length);
      };
      reader.readAsDataURL(file);
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) {
      const kb = bytes / 1024;
      return kb.toFixed(2) + ' KB';
    }
    if (bytes < 1024 * 1024 * 1024) {
      const mb = bytes / (1024 * 1024);
      return mb.toFixed(2) + ' MB';
    }
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  }

  // Advanced image compression method
  private async compressImage(imageUri: string, originalSize: number): Promise<string | null> {
    try {
      console.log('Attempting to compress image...');
      
      // Create a canvas to compress the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate new dimensions to reduce file size
          const maxDimension = 800; // Reduce dimensions to help with compression
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw the resized image
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with lower quality
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('Compressed image size:', this.formatFileSize(blob.size));
              
              // Check if compression was successful
              if (blob.size <= 2 * 1024 * 1024) {
                const compressedUri = URL.createObjectURL(blob);
                resolve(compressedUri);
              } else {
                console.log('Compression failed - image still too large');
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.6); // Use JPEG with 60% quality
        };
        
        img.onerror = () => {
          console.error('Failed to load image for compression');
          resolve(null);
        };
        
        img.src = imageUri;
      });
      
    } catch (error) {
      console.error('Error compressing image:', error);
      return null;
    }
  }

  // Enhanced image processing with fallback handling
  private handleImageLoadError(originalURI: string): void {
    console.log('Attempting alternative image processing for:', originalURI);
    
    // For file:// URIs, try to convert to blob URL
    if (originalURI.startsWith('file://')) {
      this.convertFileUriToBlob(originalURI);
    } else if (originalURI.startsWith('content://')) {
      // For content:// URIs, try to read as base64
      this.convertContentUriToBlob(originalURI);
    } else {
      // For other URIs, try fetch
      this.convertUriToBlob(originalURI);
    }
  }

  private convertFileUriToBlob(fileUri: string): void {
    // For file:// URIs, we need to use a different approach
    console.log('Converting file URI to blob:', fileUri);
    
    // Try to read the file using FileReader
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fileUri, true);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const blobUrl = URL.createObjectURL(blob);
        this.processImageFromBlobUrl(blobUrl);
      } else {
        console.error('Failed to load file URI:', xhr.status);
        this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '');
        this.enableLoader = false;
      }
    };
    
    xhr.onerror = () => {
      console.error('XHR error loading file URI');
      this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '');
      this.enableLoader = false;
    };
    
    xhr.send();
  }

  private convertContentUriToBlob(contentUri: string): void {
    console.log('Converting content URI to blob:', contentUri);
    
    // For content:// URIs, try to use fetch with special handling
    fetch(contentUri)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        this.processImageFromBlobUrl(blobUrl);
      })
      .catch(error => {
        console.error('Failed to convert content URI to blob:', error);
        this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '');
        this.enableLoader = false;
      });
  }

  private convertUriToBlob(uri: string): void {
    console.log('Converting URI to blob:', uri);
    
    fetch(uri)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        this.processImageFromBlobUrl(blobUrl);
      })
      .catch(error => {
        console.error('Failed to create blob from URI:', error);
        this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '');
        this.enableLoader = false;
      });
  }

  private processImageFromBlobUrl(blobUrl: string): void {
    console.log('Processing image from blob URL:', blobUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('Image loaded via blob URL');
      this.processImageWithCanvas(img);
      URL.revokeObjectURL(blobUrl); // Clean up
    };
    
    img.onerror = () => {
      console.error('Failed to load image via blob URL');
      URL.revokeObjectURL(blobUrl); // Clean up
      this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '');
      this.enableLoader = false;
    };
    
    img.src = blobUrl;
  }

  private processImageWithCanvas(img: HTMLImageElement): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Clear canvas and draw image
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(img, 0, 0);

    canvas.toBlob((pngBlob) => {
      if (pngBlob) {
        console.log('PNG blob created via alternative method, size:', pngBlob.size);
        
        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (pngBlob.size > maxSize) {
          this.showToast('error', `Image is too large (${this.formatFileSize(pngBlob.size)}). Maximum size allowed is 2MB. Please select a smaller image.`, '', 4000, '');
          this.enableLoader = false;
          return;
        }

        const file = new File([pngBlob], `camera-image-${Date.now()}.png`, { type: 'image/png' });
        
        // Create image object and add to selectedImages
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push({
            file: file,
            preview: e.target.result
          });
          console.log('Camera image added to selectedImages:', this.selectedImages.length);
          this.enableLoader = false;
        };
        reader.readAsDataURL(file);
      } else {
        console.error('Failed to create PNG blob via alternative method');
        this.showToast('error', 'Failed to process image format. Please try again.', '', 4000, '');
        this.enableLoader = false;
      }
    }, 'image/png', 0.9);
  }

  // Custom camera interface methods
  public captureImageFromVideo(): void {
    try {
      console.log('Capturing image from video...');
      
      const videoElement = document.getElementById('cameraVideo') as HTMLVideoElement;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!videoElement || !ctx) {
        this.showToast('error', 'Failed to capture image', '', 4000, '');
        return;
      }

      // Set canvas size to match video dimensions
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Calculate viewfinder area (center square)
      const viewfinderSize = Math.min(videoElement.videoWidth, videoElement.videoHeight) * 0.8;
      const x = (videoElement.videoWidth - viewfinderSize) / 2;
      const y = (videoElement.videoHeight - viewfinderSize) / 2;

      // Draw the video frame
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Create a new canvas for the cropped image
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');

      if (!croppedCtx) {
        this.showToast('error', 'Failed to process image', '', 4000, '');
        return;
      }

      // Set cropped canvas size to viewfinder size
      croppedCanvas.width = viewfinderSize;
      croppedCanvas.height = viewfinderSize;

      // Draw only the viewfinder area
      croppedCtx.drawImage(
        canvas,
        x, y, viewfinderSize, viewfinderSize, // Source rectangle
        0, 0, viewfinderSize, viewfinderSize  // Destination rectangle
      );

      // Convert to blob and process
      croppedCanvas.toBlob((blob) => {
        if (blob) {
          const imageUri = URL.createObjectURL(blob);
          this.handleCapturedImage(imageUri);
        } else {
          this.showToast('error', 'Failed to capture image', '', 4000, '');
        }
      }, 'image/jpeg', 0.8);

    } catch (error) {
      console.error('Error capturing image:', error);
      this.showToast('error', 'Failed to capture image', '', 4000, '');
    }
  }

  public closeCameraInterface(): void {
    console.log('Closing camera interface...');
    
    // Stop camera stream
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    
    // Hide camera interface
    this.showCameraInterface = false;
  }

  private async handleCapturedImage(imageUri: string): Promise<void> {
    try {
      console.log('Handling captured image:', imageUri);
      
      // Close camera interface first
      this.closeCameraInterface();
      
      // Show loading indicator
      this.enableLoader = true;
      
      // Process the captured image
      await this.checkImageSizeAndProcess(imageUri);
    } catch (error) {
      console.error('Error handling captured image:', error);
      this.showToast('error', 'Failed to process captured image', '', 4000, '');
      this.enableLoader = false;
    }
  }

  onUomChange(event: any) {
    console.log('UOM changed:', event.detail.value);
    console.log('Form UOM value:', this.itemForm.get('uom_id')?.value);
  }

  // Method to manually set UOM value (for testing)
  setUomValue(value: number) {
    this.itemForm.patchValue({ uom_id: value });
    console.log('UOM manually set to:', value);
    console.log('Form UOM value after setting:', this.itemForm.get('uom_id')?.value);
  }

  // Debug method to check current state
  debugCurrentState() {
    console.log('=== DEBUG CURRENT STATE ===');
    console.log('selectedImages:', this.selectedImages);
    console.log('selectedVideo:', this.selectedVideo);
    console.log('selectedImages.length:', this.selectedImages.length);
    console.log('selectedVideo exists:', !!this.selectedVideo);
    console.log('Form valid:', this.itemForm?.valid);
    console.log('Form values:', this.itemForm?.value);
    console.log('========================');
  }

  // Convert URL to File object
  async urlToFile(url: string, filename: string): Promise<File> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error converting URL to file:', error);
      throw error;
    }
  }

    async onSubmit() {
    this.submitted = true;
    
    // Check if form is properly initialized
    if (!this.itemForm) {
      console.error('Form is not initialized');
      return;
    }
    
    if (this.itemForm.invalid) {
      return;
    }
    const formData = new FormData();

    // Add form fields
    if(this.itemId){
     formData.append('id', this.itemForm.get('id')?.value || '');
    }
    formData.append('item_name', this.itemForm.get('item_name')?.value);
    formData.append('hsn_code', this.itemForm.get('hsn_code')?.value);
    formData.append('item_listed_for', this.itemForm.get('item_listed_for')?.value);
    formData.append('uom_id', this.itemForm.get('uom_id')?.value);
    formData.append('description', this.itemForm.get('description')?.value || '');
    formData.append('price', this.itemForm.get('price')?.value);
    formData.append('quantity', this.itemForm.get('quantity')?.value);

    // Add images - handle both new files and existing URLs
    for (let i = 0; i < this.selectedImages.length; i++) {
      const image = this.selectedImages[i];
      if (image.file == null && image.preview !== null) {
        try {
          // Convert URL to file object
          const file = await this.urlToFile(image.preview, `image_${i}.jpg`);
          formData.append('image[]', file);
        } catch (error) {
          console.error('Error converting URL to file:', error);
          // Fallback: append the URL as string
          formData.append('image[]', image.preview);
        }
      } else {
        formData.append('image[]', image.file);
      }
    }

    // Add video if selected
    if (this.selectedVideo) {
      if (this.selectedVideo.file == null && this.selectedVideo.preview !== null) {
        try {
          // Convert video URL to file object
          const videoFile = await this.urlToFile(this.selectedVideo.preview, 'video.mp4');
          formData.append('video', videoFile);
        } catch (error) {
          console.error('Error converting video URL to file:', error);
          // Fallback: append the URL as string
          formData.append('video', this.selectedVideo.preview);
        }
      } else {
        formData.append('video', this.selectedVideo.file);
      }
    }

    // Determine if this is an add or edit operation
    let url = 'items/add';
    this.enableLoader = true;
    this.commonService.filepost(url, formData).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          const successMessage = this.itemId ? 'Item updated successfully' : 'Item added successfully';
          //const redirectUrl = this.itemId ? '/my-item' : '/item-list';
          this.showToast('success', successMessage, '', 2500, '/my-item');
        } else {
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );
  }

  async showToast(
    status: string,
    message: string,
    submessage: string,
    timer: number,
    redirect: string
  ) {
    const modal = await this.modalController.create({
      component: ToastModalComponent,
      cssClass: 'toast-modal',
      componentProps: {
        status: status,
        message: message,
        submessage: submessage,
        timer: timer,
        redirect: redirect
      }
    });
    return await modal.present();
  }



}
