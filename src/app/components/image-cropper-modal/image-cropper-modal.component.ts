import { Component, Input, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { CommonModule } from '@angular/common';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-image-cropper-modal',
  templateUrl: './image-cropper-modal.component.html',
  styleUrls: ['./image-cropper-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ImageCropperComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon
  ]
})
export class ImageCropperModalComponent implements OnInit {
  @ViewChild(ImageCropperComponent) cropper!: ImageCropperComponent;
  @ViewChild('fileInput', { static: false }) fileInput!: any;
  
  @Input() imageUrl: string = '';
  @Input() aspectRatio: number = 1; // 1:1 aspect ratio by default
  @Input() maintainAspectRatio: boolean = true;
  @Input() cropperTitle: string = 'Crop Image';

  croppedImage: string | Blob = '';
  isCropping: boolean = false;
  imageChangedEvent: any = null;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('ImageCropperModalComponent ngOnInit - imageUrl:', this.imageUrl);
    // Convert the image URL to a proper event for the cropper
    setTimeout(() => {
      this.loadImageForCropper();
    }, 100);
  }

  ngAfterViewInit() {
    // Try loading again after view is initialized
    setTimeout(() => {
      if (!this.imageChangedEvent) {
        console.log('Retrying image load in ngAfterViewInit');
        this.loadImageForCropper();
      }
    }, 1000); // Increased timeout to ensure file input is available
  }

  private async loadImageForCropper() {
    try {
      console.log('Loading image for cropper:', this.imageUrl);
      
      // Convert any URL to a File object and trigger the file input
      let file: File;
      
      if (this.imageUrl.startsWith('data:')) {
        console.log('Converting data URL to file');
        const response = await fetch(this.imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      } else if (this.imageUrl.startsWith('blob:')) {
        console.log('Converting blob URL to file');
        const response = await fetch(this.imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      } else {
        console.log('Converting other URL to file');
        const response = await fetch(this.imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      }
      
      // Create a DataTransfer object and set the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Set the file input's files property
      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.files = dataTransfer.files;
        
        // Create and dispatch the change event
        const event = new Event('change', { bubbles: true });
        this.fileInput.nativeElement.dispatchEvent(event);
        
        console.log('File input triggered with file:', file);
      } else {
        console.log('File input not available, using direct event');
        this.imageChangedEvent = {
          target: {
            files: [file]
          }
        };
        this.cdr.detectChanges();
      }
      
    } catch (error) {
      console.error('Error loading image for cropper:', error);
      this.loadImageFailed();
    }
  }

  imageCropped(event: any) {
    console.log('Image cropped event:', event);
    if (event && event.blob) {
      this.croppedImage = event.blob;
      console.log('Cropped image saved as blob');
    } else if (event && event.base64) {
      this.croppedImage = event.base64;
      console.log('Cropped image saved as base64 string');
    }
  }

  imageLoaded() {
    console.log('Image loaded successfully in cropper');
    this.isCropping = true;
    this.cdr.detectChanges();
  }

  cropperReady() {
    console.log('Cropper is ready');
    this.isCropping = true;
    this.cdr.detectChanges();
  }

  loadImageFailed() {
    console.error('Image failed to load in cropper');
    this.showToast('error', 'Failed to load image for cropping', '', 3000, '');
  }

  async cropImage() {
    console.log('cropImage called');
    console.log('croppedImage exists:', !!this.croppedImage);
    console.log('croppedImage type:', typeof this.croppedImage);
    console.log('isCropping:', this.isCropping);
    
    // Always try to get the current crop
    console.log('Getting current crop...');
    this.getCurrentCrop();
    
    // Wait a bit for the crop to be processed
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (this.croppedImage) {
      try {
        console.log('Processing cropped image...');
        
        let file: File;
        
        // Check if croppedImage is already a Blob or File
        if (this.croppedImage instanceof Blob) {
          console.log('croppedImage is already a Blob');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          file = new File([this.croppedImage], `profile_image_${timestamp}.jpg`, { 
            type: 'image/jpeg',
            lastModified: Date.now()
          });
        } else if (typeof this.croppedImage === 'string') {
          console.log('croppedImage is a string, converting to blob');
          // Convert base64 to blob with proper MIME type
          const base64Data = this.croppedImage.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          
          // Create a file from the blob with proper extension, MIME type, and timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          file = new File([blob], `profile_image_${timestamp}.jpg`, { 
            type: 'image/jpeg',
            lastModified: Date.now()
          });
        } else {
          console.error('Unknown croppedImage type:', typeof this.croppedImage);
          this.showToast('error', 'Invalid cropped image format', '', 3000, '');
          return;
        }
        
        console.log('Created cropped file:', file);
        
        // Close modal and return the cropped file
        this.modalController.dismiss({
          cropped: true,
          file: file,
          imageUrl: this.croppedImage
        });
      } catch (error) {
        console.error('Error processing cropped image:', error);
        this.showToast('error', 'Failed to process cropped image', '', 3000, '');
      }
    } else {
      console.log('No cropped image available');
      this.showToast('error', 'Please crop the image first', '', 3000, '');
    }
  }

  cancel() {
    this.modalController.dismiss({
      cropped: false
    });
  }

  private showToast(type: string, message: string, title: string, duration: number, redirectTo: string) {
    // This would typically use your toast service
    console.log(`${type}: ${message}`);
  }

  retryLoadImage() {
    console.log('Manual retry triggered');
    this.loadImageForCropper();
  }

  onFileSelected(event: any) {
    console.log('File selected:', event);
    this.imageChangedEvent = event;
  }

  // Method to manually trigger file input
  triggerFileInput() {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  // Fallback method using file input approach
  async tryFileInputApproach() {
    try {
      console.log('Trying file input approach...');
      
      // Convert any URL to a File object
      let file: File;
      
      if (this.imageUrl.startsWith('data:')) {
        console.log('Converting data URL to file');
        const response = await fetch(this.imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      } else if (this.imageUrl.startsWith('blob:')) {
        console.log('Converting blob URL to file');
        const response = await fetch(this.imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      } else {
        console.log('Converting other URL to file');
        const response = await fetch(this.imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      }
      
      // Create the event object that ngx-image-cropper expects
      this.imageChangedEvent = {
        target: {
          files: [file]
        }
      };
      
      console.log('Created imageChangedEvent with file:', file);
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Error in file input approach:', error);
    }
  }

  // Method to manually get the current crop
  getCurrentCrop() {
    if (this.cropper) {
      console.log('Getting current crop from cropper');
      try {
        const crop = this.cropper.crop();
        console.log('Current crop:', crop);
        if (crop && crop.base64) {
          this.croppedImage = crop.base64;
          this.cdr.detectChanges();
          console.log('Updated cropped image');
        }
      } catch (error) {
        console.error('Error getting current crop:', error);
      }
    } else {
      console.log('Cropper not available');
    }
  }
}
