import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthGuardService } from '../services/auth-guard.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonInput, ModalController, ActionSheetController, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, Platform, IonSpinner } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
// File input declarations
declare var navigator: any;
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProfileService } from '../services/profile.service';
import { PageTitleService } from '../services/page-title.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ImageCropperModalComponent } from '../components/image-cropper-modal/image-cropper-modal.component';
import { LoaderService } from '../services/loader.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonInput, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, FormsModule, ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent, IonSpinner]
})
export class ProfilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public isSubmitting: boolean = false;
  profileForm!: FormGroup;
  public type: any;
  public submitted: boolean = false;
  public profileImage: string = '';
  public showPlaceholder: boolean = true;
  public countries: any[] = [];
  public filteredCountries: any[] = [];
  public showCountryDropdown: boolean = false;
  public uploadedFiles: any[] = [];
  public selectedImages: any[] = [];
  public isDragOver: boolean = false;
  public showCameraInterface: boolean = false;
  public cameraStream: MediaStream | null = null;
  private isDeviceReady: boolean = false;

  // Method to remove an image from selectedImages array
  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  // Method to preview an image
  async previewImage(imageUrl: string) {
    // You can implement image preview functionality here
    console.log('Preview image:', imageUrl);
  }
  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private profileService: ProfileService,
    private pageTitleService: PageTitleService,
    private platform: Platform,
    private authGuardService: AuthGuardService,
    private loaderService: LoaderService
  ) {
    activatedRoute.params.subscribe(val => {
      this.pageTitleService.setPageTitle('Profile');
      this.platform.ready().then(() => {
        this.isDeviceReady = true;
      });
      this.getProfileData()
      this.loadCountries();
      this.profileForm = this.formBuilder.group({
        full_name: ['', [Validators.required, Validators.maxLength(60)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        company: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
        pan: [''],
        id_proof_type: ['', [Validators.required]],
        id_proof_image: ['', [Validators.required]],
        country: ['India', [Validators.required]],
        company_address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
        city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
        state: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
        zip: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
      });

      // Listen for country changes to update PAN validation
      this.profileForm.get('country')?.valueChanges.subscribe(country => {
        console.log('Country changed to:', country);
        const panControl = this.profileForm.get('pan');
        if (country === 'India') {
          console.log('Setting PAN as required for India');
          panControl?.setValidators([Validators.required, Validators.pattern(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/i)]);
        } else {
          console.log('Clearing PAN validation for non-India country');
          panControl?.clearValidators();
          panControl?.setValue(''); // Clear the value when not India
        }
        panControl?.updateValueAndValidity();
      });

      // Set initial PAN validation since India is default
      const panControl = this.profileForm.get('pan');
      if (panControl) {
        panControl.setValidators([Validators.required, Validators.pattern(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/i)]);
        panControl.updateValueAndValidity();
      }
    });
  }

  async ngOnInit() {
    // Check authentication on component initialization
    await this.authGuardService.checkTokenAndAuthenticate();
  }

  get f() { return this.profileForm.controls; }

  loadCountries() {
    fetch('assets/JSON/country.json')
      .then(response => response.json())
      .then(data => {
     //   console.log('Loaded countries data:', data);
        this.countries = data;
        this.filteredCountries = data; // Initialize filtered countries with all countries
      //  console.log('Countries array:', this.countries);
      //  console.log('Filtered countries array:', this.filteredCountries);
      })
      .catch(error => {
        console.error('Error loading countries:', error);
      });
  }

  filterCountries(event: any) {
    const searchTerm = event.target.value.toLowerCase();
   // console.log('Search term:', searchTerm);
   // console.log('All countries:', this.countries);

    if (searchTerm) {
      this.filteredCountries = this.countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredCountries = this.countries;
    }
    console.log('Filtered countries:', this.filteredCountries);
    this.showCountryDropdown = true;
  }

  selectCountry(countryName: string) {
    this.profileForm.patchValue({ country: countryName });
    this.showCountryDropdown = false;
    this.filteredCountries = this.countries; // Reset filtered countries
  }

  onCountryBlur() {
    console.log('Country field blurred');
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      this.showCountryDropdown = false;
      console.log('Dropdown hidden after blur');
    }, 200);
  }

  onCountryFocus() {
    console.log('Country field focused');
    this.showCountryDropdown = true;
    console.log('Dropdown shown on focus');
  }


  getProfileData() {
    this.loaderService.show();
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      async (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          // Set profile image if available, otherwise show placeholder
          if (response.user.profile_image && response.user.profile_image.trim() !== '') {
            this.profileImage = response.user.profile_image;
            this.showPlaceholder = false;
            // Update the service so header reflects the change
            this.profileService.updateProfileImage(response.user.profile_image);
            const url = response.user.id_proof_image;
            const fileName = url.split('/').pop();
            const fileResponse = await fetch(url, { method: 'HEAD' });
            if (!fileResponse.ok) {
              throw new Error(`HTTP error! Status: ${fileResponse.status}`);
            }
            // Extract file size (Content-Length header)
            const size = fileResponse.headers.get('content-length');
            this.uploadedFiles.push({
              name: fileName,
              size: size
            });
          } else {
            this.profileImage = '';
            this.showPlaceholder = true;
            // Clear the service as well
            this.profileService.updateProfileImage('');
          }
          // Update user name in service if available
          if (response.user.full_name) {
            this.profileService.updateUserName(response.user.full_name);
          }
          this.profileForm.patchValue(response.user)
                      // Format phone number - remove +91 and ensure 10 digits
            let formattedPhone = response.user.phone;
            if (formattedPhone && formattedPhone.startsWith('+91')) {
              formattedPhone = formattedPhone.substring(3); // Remove +91
            }
            // Ensure only last 10 digits
            if (formattedPhone && formattedPhone.length > 10) {
              formattedPhone = formattedPhone.slice(-10);
            }

            this.profileForm.patchValue({
              company: response.user.company_name,
              zip: response.user.zipcode,
              phone: formattedPhone,
            })
        } else {
          this.showToast('error', response.message, '', 3500, '/profile');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );

  }

  tabChange(e: any) {
    console.log('e');

  }

  onInputChange(event: any) {
    let inputValue: any = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, '');
    inputValue = inputValue.slice(0, 6);
    this.profileForm.patchValue({
      zip: inputValue
    });
  }

  goToDashboard(event: Event) {
    event.preventDefault(); // prevent default tab switch
    this.router.navigateByUrl('/dashboard');
  }

  // File upload methods
  onFileSelected(event: any) {
    const files = event.target.files;
    this.processFiles(files);
  }



  processFiles(files: FileList) {
    const maxFiles = 1;
    const maxSize = 5 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (this.uploadedFiles.length + files.length > maxFiles) {
      this.showToast('error', `Maximum ${maxFiles} files allowed`, '', 3000, '/profile');
      return;
    }

    Array.from(files).forEach((file: File) => {
      console.log('=== FILE PROCESSING DEBUG ===');
      console.log('File name:', file.name);
      console.log('File size in bytes:', file.size);
      console.log('File size type:', typeof file.size);
      console.log('Max size in bytes:', maxSize);
      console.log('Is file size > maxSize?', file.size > maxSize);
      console.log('Original size formatted:', this.formatFileSize(file.size));
      console.log('============================');

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        this.showToast('error', `${file.name} is not a supported file type`, '', 3000, '/profile');
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        const formattedSize = this.formatFileSize(file.size);
        console.log('File rejected - size:', formattedSize);
        this.showToast('error', `${file.name} is too large (${formattedSize}). Maximum size is 5MB`, '', 3000, '/profile');
        return;
      }

      // Convert file to PNG format using canvas (like profile photo)
      if (file.type.startsWith('image/')) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              console.log('Converted file size:', this.formatFileSize(pngBlob.size));

              // Check if converted file is still under 2MB
              if (pngBlob.size > maxSize) {
                this.showToast('error', `Image conversion resulted in file too large (${this.formatFileSize(pngBlob.size)}). Please try a smaller image.`, '', 4000, '/profile');
                return;
              }

              const convertedFile = new File([pngBlob], `${file.name.split('.')[0]}.png`, { type: 'image/png' });

              // Create file object with converted file
              const fileObj = {
                file: convertedFile,
                name: convertedFile.name,
                size: convertedFile.size,
                type: convertedFile.type,
                preview: null
              };

              // Generate preview
              const reader = new FileReader();
              reader.onload = (e: any) => {
                fileObj.preview = e.target.result;
              };
              reader.readAsDataURL(convertedFile);

              this.uploadedFiles.push(fileObj);

              // Update form control
              if (this.uploadedFiles && Array.isArray(this.uploadedFiles) && this.uploadedFiles.length > 0) {
                this.profileForm.patchValue({
                  id_proof_image: this.uploadedFiles.map(f => f.file)
                });
              }
            }
          }, 'image/png', 0.8); // Add compression to reduce file size
        };

        // Load image from file
        const reader = new FileReader();
        reader.onload = (e: any) => {
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, use original file
        const fileObj = {
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: null
        };

        this.uploadedFiles.push(fileObj);

        // Update form control
        this.profileForm.patchValue({
          id_proof_image: this.uploadedFiles[0]
        });
      }
    });
  }

  removeFile(index: number) {
    if (this.uploadedFiles && Array.isArray(this.uploadedFiles) && this.uploadedFiles.length > 0) {
      this.uploadedFiles.splice(index, 1);
      this.profileForm.patchValue({
        id_proof_image: this.uploadedFiles.map(f => f.file)
      });
    }
  }

  formatFileSize(bytes: number): string {
  //  console.log('formatFileSize called with bytes:', bytes, 'Type:', typeof bytes);

    if (bytes === 0) return '0 Bytes';
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) {
      const kb = bytes / 1024;
      return kb.toFixed(2) + ' KB';
    }
    if (bytes < 1024 * 1024 * 1024) {
      const mb = bytes / (1024 * 1024);
      console.log('Converting to MB:', mb);
      return mb.toFixed(2) + ' MB';
    }
    const gb = bytes / (1024 * 1024 * 1024);
    console.log('Converting to GB:', gb);
    return gb.toFixed(2) + ' GB';
  }

  async openCamera() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source (Max 5MB)',
      subHeader: 'Images larger than 5MB will be automatically rejected',
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

  // Camera method for file upload area
  async openCameraForUpload() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Upload Method (Max 5MB)',
      subHeader: 'Choose how to add your ID proof document',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => {
            this.takePictureForUpload('camera');
          }
        },
        {
          text: 'Photo Library',
          icon: 'images',
          handler: () => {
            this.takePictureForUpload('library');
          }
        },
        {
          text: 'Browse Files',
          icon: 'document',
          handler: () => {
            this.fileInput.nativeElement.click();
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
      this.showToast('error', 'Failed to select image. Please try again.', '', 4000, '/profile');
    }
  }

  // Camera method for file upload area
  async takePictureForUpload(source: string) {
    try {
      console.log('takePictureForUpload called with source:', source);

      // Check if native camera is available
      if (this.checkCameraAvailability()) {
        try {
          await this.useNativeCameraForUpload(source);
        } catch (cameraError) {
          console.error('Native camera failed, falling back to file input:', cameraError);
          this.openFileInputForUpload(source);
        }
      } else {
        // Fallback to file input for web, desktop, or when camera is not available
        console.log('Native camera not available, using file input');
        this.openFileInputForUpload(source);
      }

    } catch (error: any) {
      console.error('Image selection error for upload:', error);
      this.showToast('error', 'Failed to select image. Please try again.', '', 4000, '/profile');
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

      // // Show size limit warning for camera
      // if (source === 'camera') {
      //   this.showToast('info', 'Camera mode: Images will be automatically optimized to stay under 2MB', '', 3000, '/profile');
      // }

      const image = await Camera.getPhoto({
        quality: 60, // Reduced quality to help stay under 2MB
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: cameraSource,
        width: 800, // Optimized for 2MB limit
        height: 800, // Optimized for 2MB limit
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
        this.showToast('error', 'No image selected', '', 3000, '/profile');
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
        this.showToast('error', 'Camera permission is required. Please enable camera access in your device settings.', '', 5000, '/profile');
        return;
      }

      // Handle hardware errors
      if (error.message && (error.message.includes('hardware') || error.message.includes('Hardware'))) {
        this.showToast('error', 'Camera hardware not available. Please try selecting from gallery instead.', '', 4000, '/profile');
        this.openFileInputWithSource('library');
        return;
      }

      // Fallback to file input if native camera fails
      console.log('Falling back to file input due to camera error');
      this.openFileInputWithSource(source);
      this.loaderService.hide();
    }
  }

  private async checkImageSizeAndProcess(imageUri: string): Promise<void> {
    try {
      // Fetch the image to check its size
      const response = await fetch(imageUri);
      const blob = await response.blob();

      console.log('Image size before processing:', this.formatFileSize(blob.size));

      // Check if image is already under 2MB
      const maxSize = 5 * 1024 * 1024; // 2MB
      if (blob.size > maxSize) {
        // Try to compress the image before rejecting
        const compressedImageUri = await this.compressImage(imageUri, blob.size);
        if (compressedImageUri) {
          console.log('Image compressed successfully');
          this.processImageURI(compressedImageUri);
        } else {
          this.showToast('error', `Image is too large (${this.formatFileSize(blob.size)}). Maximum size allowed is 5MB. Please try again with a smaller image or lower quality.`, '', 5000, '/profile');
          this.resetImageDisplay();
          this.loaderService.hide();
        }
        return;
      }

      // If size is acceptable, process the image
      this.processImageURI(imageUri);

    } catch (error) {
      console.error('Error checking image size:', error);
      this.loaderService.hide();
      // If we can't check the size, proceed with processing and let the existing size check handle it
      this.processImageURI(imageUri);
    }
  }

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
          const maxDimension = 600; // Reduce dimensions to help with compression
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
              if (blob.size <= 5 * 1024 * 1024) {
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
      this.loaderService.hide();
      return null;
    }
  }

  private compressImageForProfile(imageUri: string, originalSize: number): void {
    console.log('Attempting to compress profile image...');
    console.log('Original size:', this.formatFileSize(originalSize));

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions to reduce file size
      let { width, height } = img;
      const maxDimension = 600; // Reduce dimensions to help with compression

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

      // Try different quality levels
      const qualityLevels = [0.8, 0.6, 0.4, 0.2];

      const tryCompression = (index: number) => {
        if (index >= qualityLevels.length) {
          // All compression attempts failed
          this.showToast('error', `Image is too large (${this.formatFileSize(originalSize)}). Maximum size allowed is 5MB. Please try again with a smaller image.`, '', 4000, '/profile');
          this.resetImageDisplay();
          this.loaderService.hide();
          return;
        }

        const quality = qualityLevels[index];
        console.log(`Trying compression with quality: ${quality}`);

        canvas.toBlob((blob) => {
          if (blob) {
            console.log(`Compressed size with quality ${quality}:`, this.formatFileSize(blob.size));

            if (blob.size <= 5 * 1024 * 1024) {
              // Success! Upload the compressed image
              const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
              this.uploadProfileImage(file);
            } else {
              // Try next quality level
              tryCompression(index + 1);
            }
          } else {
            // Try next quality level
            tryCompression(index + 1);
          }
        }, 'image/jpeg', quality);
      };

      tryCompression(0);
    };

    img.onerror = () => {
      console.error('Failed to load image for compression');
      this.showToast('error', `Image is too large (${this.formatFileSize(originalSize)}). Maximum size allowed is 5MB. Please try again with a smaller image.`, '', 4000, '/profile');
      this.resetImageDisplay();
      this.loaderService.hide();
    };

    img.src = imageUri;
  }

  private uploadProfileImage(file: File): void {
    console.log('Uploading compressed profile image, size:', this.formatFileSize(file.size));
    console.log('File type:', file.type);
    console.log('File name:', file.name);
    console.log('File lastModified:', file.lastModified);

    // Validate file before upload
    if (!file || file.size === 0) {
      this.showToast('error', 'Invalid file: File is empty or corrupted', '', 3000, '/profile');
      this.loaderService.hide();
      return;
    }

    // Check if file type is valid
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.showToast('error', `Invalid file type: ${file.type}. Please select a valid image file.`, '', 3000, '/profile');
      this.loaderService.hide();
      return;
    }

    // Check file size (max 2MB)
    const maxSize = 5 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      this.showToast('error', `File too large: ${this.formatFileSize(file.size)}. Maximum size is 5MB.`, '', 3000, '/profile');
      this.loaderService.hide();
      return;
    }

    let url = 'user/update-profile-image';
    const formData = new FormData();

    // Try with the standard field name first
    formData.append('profile_image', file);
    // Log FormData for debugging
    console.log('FormData created with file:', file.name);

    this.commonService.filepost(url, formData).subscribe(
      (res: any) => {
        this.loaderService.hide();
        // Handle different response types
        if (res.code == 200) {
          this.showToast('success', res.message, '', 2500, '');

        } else {
          this.showToast('error', res.message, '', 2500, '/profile');

        }
        this.getProfileData();
      },
      (error) => {
        this.loaderService.hide();
        console.log('Upload error:', error);
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        console.log('Error response:', error.error);

        // Handle specific error cases
        if (error.status === 422) {
          this.showToast('error', 'Invalid image format. Please try with a different image.', '', 3000, '/profile');
        } else if (error.status === 413) {
          this.showToast('error', 'Image file is too large. Please select a smaller image.', '', 3000, '/profile');
        } else {
          this.showToast('error', 'Upload failed. Please try again.', '', 2500, '/profile');
        }
        this.getProfileData()
      }
    );
  }

  public captureImageFromVideo(): void {
    try {
      console.log('Capturing image from video...');

      const videoElement = document.getElementById('cameraVideo') as HTMLVideoElement;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!videoElement || !ctx) {
        this.showToast('error', 'Failed to capture image', '', 4000, '/profile');
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
        this.showToast('error', 'Failed to process image', '', 4000, '/profile');
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
          this.showToast('error', 'Failed to capture image', '', 4000, '/profile');
        }
      }, 'image/jpeg', 0.8);

    } catch (error) {
      console.error('Error capturing image:', error);
      this.showToast('error', 'Failed to capture image', '', 4000, '/profile');
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

      // Show image cropper modal
      await this.openImageCropper(imageUri);
    } catch (error) {
      console.error('Error handling captured image:', error);
      this.showToast('error', 'Failed to process captured image', '', 4000, '/profile');
      this.resetImageDisplay();
      this.loaderService.hide();
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
          cropperTitle: 'Crop Profile Image'
        },
        cssClass: 'image-cropper-modal'
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();

      if (data && data.cropped) {
        // Show loading indicator
        this.loaderService.show();

        // Process the cropped image
        await this.processCroppedImage(data.file);
      } else {
        this.getProfileData();
        // User cancelled cropping, reset image display
        this.resetImageDisplay();
      }
    } catch (error) {
      console.error('Error opening image cropper:', error);
      this.getProfileData();
      this.showToast('error', 'Failed to open image cropper', '', 4000, '/profile');
      this.resetImageDisplay();
    }
  }

  private async processCroppedImage(file: File): Promise<void> {
    try {
      console.log('Processing cropped image, size:', this.formatFileSize(file.size));

      // Check file size
      const maxSize = 5 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.showToast('error', `Image is too large (${this.formatFileSize(file.size)}). Maximum size allowed is 5MB.`, '', 5000, '/profile');
        this.resetImageDisplay();
        this.loaderService.hide();
        return;
      }

      // Upload the cropped image
      this.uploadProfileImage(file);
    } catch (error) {
      console.error('Error processing cropped image:', error);
      this.showToast('error', 'Failed to process cropped image', '', 4000, '/profile');
      this.resetImageDisplay();
      this.loaderService.hide();
    }
  }

  private async openImageCropperForUpload(imageUri: string): Promise<void> {
    try {
      const modal = await this.modalController.create({
        component: ImageCropperModalComponent,
        componentProps: {
          imageUrl: imageUri,
          aspectRatio: 210 / 297, // 1:1 aspect ratio
          maintainAspectRatio: true,
          cropperTitle: 'Crop Document Image'
        },
        cssClass: 'image-cropper-modal'
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();

      if (data && data.cropped) {
        // Show loading indicator
        this.loaderService.show();

        // Process the cropped image for upload
        await this.processCroppedImageForUpload(data.file);
      } else {
        // User cancelled cropping, reset image display
        this.resetImageDisplay();
      }
    } catch (error) {
      console.error('Error opening image cropper for upload:', error);
      this.showToast('error', 'Failed to open image cropper', '', 4000, '/profile');
      this.resetImageDisplay();
    }
  }

  private async processCroppedImageForUpload(file: File): Promise<void> {
    try {
      console.log('Processing cropped image for upload, size:', this.formatFileSize(file.size));

      // Check file size
      const maxSize = 5 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.showToast('error', `Image is too large (${this.formatFileSize(file.size)}). Maximum size allowed is 5MB.`, '', 5000, '/profile');
        this.resetImageDisplay();
        this.loaderService.hide();
        return;
      }

      // Add the file to uploaded files array
      this.uploadedFiles.push({
        file: file,
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file)
      });

      // Update form control
      const currentFiles = this.profileForm.get('id_proof_image')?.value || [];
      this.profileForm.get('id_proof_image')?.setValue([...currentFiles, file]);

      this.loaderService.hide();
      this.showToast('success', 'Document image added successfully', '', 2500, '/profile');
    } catch (error) {
      console.error('Error processing cropped image for upload:', error);
      this.showToast('error', 'Failed to process cropped image', '', 4000, '/profile');
      this.resetImageDisplay();
      this.loaderService.hide();
    }
  }

  private openFileInput(): void {
    this.openFileInputWithSource('library');
  }

  private openFileInputWithSource(source: string): void {
    // Create a hidden file input with camera capture support
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // Set capture attribute for camera on mobile devices
    if (source === 'camera') {
      fileInput.setAttribute('capture', 'camera');
    }

    fileInput.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        console.log('File selected:', file.name, 'Size:', file.size);

        // Check file size before processing - enforce 2MB limit
        const maxSize = 5 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
          this.showToast('error', `Image is too large (${this.formatFileSize(file.size)}). Maximum size allowed is 5MB. Please select a smaller image.`, '', 4000, '/profile');
          document.body.removeChild(fileInput);
          return;
        }

        // Show loading indicator
        this.loaderService.show();

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.processImageURI(e.target.result);
        };
        reader.onerror = () => {
          this.loaderService.hide();
          this.showToast('error', 'Failed to read image file. Please try again.', '', 4000, '/profile');
        };
        reader.readAsDataURL(file);
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

  private async processImageURI(imageURI: string): Promise<void> {
    try {
      console.log('Processing image URI:', imageURI);

      // Convert file/content URI to a displayable path in WebView
      const displaySrc = (window as any).Ionic?.WebView?.convertFileSrc
        ? (window as any).Ionic.WebView.convertFileSrc(imageURI)
        : imageURI;

      console.log('Display source:', displaySrc);

      // Store the displayable image URI directly in the variable
      this.profileImage = displaySrc;
      this.showPlaceholder = false;
      // Update the service immediately so header shows the new image
      this.profileService.updateProfileImage(displaySrc);

      // Convert to PNG format using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Set crossOrigin to anonymous to handle CORS issues
      img.crossOrigin = 'anonymous';

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('Image load timeout');
        this.showToast('error', 'Image loading timed out. Please try again.', '', 4000, '/profile');
        this.resetImageDisplay();
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
            const maxSize = 5 * 1024 * 1024; // 2MB
            if (pngBlob.size > maxSize) {
              // Try to compress the image further
              this.compressImageForProfile(imageURI, pngBlob.size);
              return;
            }

            const file = new File([pngBlob], 'profile-photo.png', { type: 'image/png' });

            // Upload the image to server using FormData
            let url = 'user/update-profile-image';
            const formData = new FormData();
            formData.append('profile_image', file);

            this.commonService.filepost(url, formData).subscribe(
              (res: any) => {
                this.loaderService.hide();
                console.log('Response type:', typeof res);
                console.log('Response:', res);

                // Handle different response types
                let responseData;
                if (res instanceof Blob) {
                  // If response is a blob, try to parse it as JSON
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      responseData = JSON.parse(reader.result as string);
                      if (responseData.code == 200) {
                        this.showToast('success', responseData.message, '', 2500, '');
                      } else {
                        this.showToast('error', responseData.message, '', 2500, '/profile');
                        this.getProfileData()
                      }
                    } catch (e) {
                      console.error('Error parsing blob response:', e);
                      this.showToast('error', 'Invalid response format', '', 2500, '/profile');
                      this.getProfileData()
                    }
                  };
                  reader.readAsText(res);
                } else {
                  // Handle regular JSON response
                  responseData = res;
                  if (responseData.code == 200) {
                    this.showToast('success', responseData.message, '', 2500, '');
                  } else {
                    this.showToast('error', responseData.message, '', 2500, '/profile');
                  }
                  this.getProfileData()
                }
              },
              (error) => {
                this.loaderService.hide();
                console.log('error ts: ', error.error);
                this.showToast('error', 'Upload failed', '', 2500, '');
                this.getProfileData()
              }
            );
          } else {
            console.error('Failed to create PNG blob');
            this.showToast('error', 'Failed to process image format. Please try again.', '', 4000, '/profile');
            this.resetImageDisplay();
            this.loaderService.hide();
          }
        }, 'image/png', 0.9); // Add quality parameter for better compression
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        console.error('Image source that failed:', displaySrc);

        // Check if this is a camera image (file:// URI)
        if (imageURI.startsWith('file://') || imageURI.startsWith('content://')) {
          console.log('Detected camera image, trying alternative processing');
          this.handleImageLoadError(imageURI);
        } else {
          // For other types of images, show generic error
          this.showToast('error', 'Failed to process image. Please try again.', '', 4000, '/profile');
          this.resetImageDisplay();
          this.loaderService.hide();
        }
      };

      img.src = displaySrc;
    } catch (error: any) {
      console.error('Image processing error:', error);
      this.showToast('error', 'Failed to process image. Please try again.', '', 4000, '/profile');
      this.resetImageDisplay();
      this.loaderService.hide();
    }
  }

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
        this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '/profile');
        this.loaderService.hide();
        this.resetImageDisplay();
      }
    };

    xhr.onerror = () => {
      console.error('XHR error loading file URI');
      this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '/profile');
      this.loaderService.hide();
      this.resetImageDisplay();
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
        this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '/profile');
        this.loaderService.hide();
        this.resetImageDisplay();
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
        this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '/profile'); ``
        this.resetImageDisplay();
        this.loaderService.hide();
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
      this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '/profile');
      this.loaderService.hide();
      this.resetImageDisplay();
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
        const maxSize = 5 * 1024 * 1024; // 2MB
        if (pngBlob.size > maxSize) {
          this.showToast('error', `Image is too large (${this.formatFileSize(pngBlob.size)}). Maximum size allowed is 5MB. Please select a smaller image.`, '', 4000, '/profile');
          this.resetImageDisplay();
          return;
        }

        const file = new File([pngBlob], 'profile-photo.png', { type: 'image/png' });

        // Upload the image to server using FormData
        let url = 'user/update-profile-image';
        const formData = new FormData();
        formData.append('profile_image', file);

        this.commonService.filepost(url, formData).subscribe(
          (res: any) => {
            this.loaderService.hide();
            console.log('Response type:', typeof res);
            console.log('Response:', res);

            // Handle different response types
            let responseData;
            if (res instanceof Blob) {
              // If response is a blob, try to parse it as JSON
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  responseData = JSON.parse(reader.result as string);
                  if (responseData.code == 200) {
                    this.showToast('success', responseData.message, '', 2500, '');
                  } else {
                    this.showToast('error', responseData.message, '', 2500, '/profile');
                    this.getProfileData()
                  }
                } catch (e) {
                  console.error('Error parsing blob response:', e);
                  this.showToast('error', 'Invalid response format', '', 2500, '/profile');
                  this.getProfileData()
                }
              };
              reader.readAsText(res);
            } else {
              // Handle regular JSON response
              responseData = res;
              if (responseData.code == 200) {
                this.showToast('success', responseData.message, '', 2500, '');
              } else {
                this.showToast('error', responseData.message, '', 2500, '/profile');
                this.loaderService.hide();
              }
              this.getProfileData()
            }
          },
          (error) => {
            this.loaderService.hide();
            console.log('error ts: ', error.error);
            this.showToast('error', 'Upload failed', '', 2500, '');
            this.getProfileData()
          }
        );
      } else {
        console.error('Failed to create PNG blob via alternative method');
        this.showToast('error', 'Failed to process image format. Please try again.', '', 4000, '/profile');
        this.resetImageDisplay();
        this.loaderService.hide();
      }
    }, 'image/png', 0.9);
  }

  private resetImageDisplay(): void {
    this.profileImage = '';
    this.showPlaceholder = true;
    this.profileService.updateProfileImage('');
  }

  // Native camera method specifically for file uploads
  private async useNativeCameraForUpload(source: string): Promise<void> {
    try {
      console.log('Attempting to use Capacitor camera for upload with source:', source);

      // Check if camera is available
      if (!Camera) {
        console.log('Capacitor Camera plugin not available, falling back to file input');
        this.openFileInputForUpload(source);
        return;
      }

      const cameraSource = source === 'camera' ? CameraSource.Camera : CameraSource.Photos;

      console.log('Using Capacitor camera for upload with source:', cameraSource);

      const image = await Camera.getPhoto({
        quality: 50, // Very low quality to ensure under 2MB
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: cameraSource,
        width: 600, // Smaller dimensions to reduce file size
        height: 600, // Smaller dimensions to reduce file size
        correctOrientation: true,
        // Add viewfinder border options for camera
        ...(source === 'camera' && {
          // These options help create a viewfinder-like experience
          presentationStyle: 'popover',
          // Set aspect ratio to create viewfinder border effect
          aspectRatio: '1:1'
        })
      });

      console.log('Camera returned image for upload:', image);
      console.log('Image webPath:', image.webPath);
      console.log('Image path:', image.path);

      if (image.webPath) {
        // Show image cropper modal for upload
        await this.openImageCropperForUpload(image.webPath);
      } else {
        this.showToast('error', 'No image selected', '', 3000, '/profile');
      }
    } catch (error: any) {
      console.error('Capacitor camera error for upload:', error);

      // Handle specific camera errors
      if (error.message && error.message.includes('cancelled')) {
        console.log('User cancelled image selection');
        return;
      }

      // Handle permission errors
      if (error.message && (error.message.includes('permission') || error.message.includes('Permission'))) {
        this.showToast('error', 'Camera permission is required. Please enable camera access in your device settings.', '', 5000, '/profile');
        return;
      }

      // Handle hardware errors
      if (error.message && (error.message.includes('hardware') || error.message.includes('Hardware'))) {
        this.showToast('error', 'Camera hardware not available. Please try selecting from gallery instead.', '', 4000, '/profile');
        this.openFileInputForUpload('library');
        return;
      }

      // Fallback to file input if native camera fails
      console.log('Falling back to file input due to camera error');
      this.openFileInputForUpload(source);
      this.loaderService.hide();
    }
  }

  // File input method specifically for uploads
  private openFileInputForUpload(source: string): void {
    // Create a hidden file input with camera capture support
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.multiple = true; // Allow multiple selection

    // Set capture attribute for camera on mobile devices
    if (source === 'camera') {
      fileInput.setAttribute('capture', 'camera');
    }

    fileInput.addEventListener('change', (event: any) => {
      const files = event.target.files;
      if (files) {
        this.processFiles(files);
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

  // Process camera image specifically for file uploads
  private async processImageForUpload(imageURI: string): Promise<void> {
    try {
      console.log('Processing camera image for upload:', imageURI);

      // Convert file/content URI to a displayable path in WebView
      const displaySrc = (window as any).Ionic?.WebView?.convertFileSrc
        ? (window as any).Ionic.WebView.convertFileSrc(imageURI)
        : imageURI;

      console.log('Display source for upload:', displaySrc);

      // Convert to PNG format using canvas for better compatibility
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Set crossOrigin to anonymous to handle CORS issues
      img.crossOrigin = 'anonymous';

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('Image load timeout for upload');
        this.showToast('error', 'Image loading timed out. Please try again.', '', 4000, '/profile');
        this.loaderService.hide();
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        console.log('Upload image loaded successfully, dimensions:', img.width, 'x', img.height);

        // Process image with compression
        this.processImageWithCanvasForUpload(img);
      };

      img.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Error loading upload image:', error);
        console.error('Image source that failed:', displaySrc);

        // For upload images, try alternative processing
        this.showToast('error', 'Failed to process camera image. Please try selecting from gallery instead.', '', 4000, '/profile');
        this.loaderService.hide();
      };

      img.src = displaySrc;

    } catch (error: any) {
      console.error('Upload image processing error:', error);
      this.showToast('error', 'Failed to process camera image. Please try again.', '', 4000, '/profile');
      this.loaderService.hide();
    }
  }

  onImageError(event: Event) {
    this.profileImage = ''; // Clear the image source
    this.showPlaceholder = true; // Show placeholder
  }

  // Process image with canvas for upload with compression
  private processImageWithCanvasForUpload(img: HTMLImageElement): void {
    console.log('Original image dimensions:', img.width, 'x', img.height);

    // Calculate new dimensions to force smaller file size
    const maxDimension = 400; // Very small dimensions to ensure small file size
    let { width, height } = img;

    // Resize image to smaller dimensions
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

    console.log('Resized dimensions:', width, 'x', height);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas to resized dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas and draw resized image
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(img, 0, 0, width, height);

    // Try different quality levels for compression (more aggressive)
    const qualityLevels = [0.5, 0.4, 0.3, 0.2, 0.1, 0.05];

    const tryCompression = (index: number) => {
      if (index >= qualityLevels.length) {
        // If all PNG compression fails, try JPEG with very low quality
        console.log('PNG compression failed, trying JPEG...');
        canvas.toBlob((jpegBlob) => {
          if (jpegBlob) {
            console.log('JPEG blob size:', this.formatFileSize(jpegBlob.size));

            const maxSize = 5 * 1024 * 1024; // 2MB
            if (jpegBlob.size <= maxSize) {
              // Success with JPEG! Create file and add to uploads
              const file = new File([jpegBlob], `camera-upload-${Date.now()}.jpg`, { type: 'image/jpeg' });
              this.addFileToUploads(file);
            } else {
              // Final fallback - resize even smaller
              this.forceResizeAndCompress(img, 300);
            }
          } else {
            this.forceResizeAndCompress(img, 300);
          }
        }, 'image/jpeg', 0.3); // Very low JPEG quality
        return;
      }

      const quality = qualityLevels[index];
      console.log(`Trying PNG compression with quality: ${quality}`);

      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          console.log(`PNG compressed size with quality ${quality}:`, this.formatFileSize(pngBlob.size));

          // Check file size (2MB = 2 * 1024 * 1024 bytes)
          const maxSize = 5 * 1024 * 1024; // 2MB
          if (pngBlob.size <= maxSize) {
            // Success! Create file and add to uploads
            const file = new File([pngBlob], `camera-upload-${Date.now()}.png`, { type: 'image/png' });
            this.addFileToUploads(file);
          } else {
            // Try next quality level
            tryCompression(index + 1);
          }
        } else {
          // Try next quality level
          tryCompression(index + 1);
        }
      }, 'image/png', quality);
    };

    tryCompression(0);
  }

  // Force resize and compress with very small dimensions
  private forceResizeAndCompress(img: HTMLImageElement, maxDimension: number): void {
    console.log(`Force resizing to ${maxDimension}x${maxDimension}`);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Force square dimensions
    canvas.width = maxDimension;
    canvas.height = maxDimension;

    // Clear canvas and draw resized image
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(img, 0, 0, maxDimension, maxDimension);

    // Try JPEG with very low quality
    canvas.toBlob((jpegBlob) => {
      if (jpegBlob) {
        console.log('Force compressed JPEG size:', this.formatFileSize(jpegBlob.size));

        const maxSize = 5 * 1024 * 1024; // 2MB
        if (jpegBlob.size <= maxSize) {
          // Success! Create file and add to uploads
          const file = new File([jpegBlob], `camera-upload-${Date.now()}.jpg`, { type: 'image/jpeg' });
          this.addFileToUploads(file);
        } else {
          // Ultimate fallback - show error
          this.showToast('error', 'Unable to compress image to required size. Please try with a different image.', '', 4000, '/profile');
          this.loaderService.hide();
        }
      } else {
        this.showToast('error', 'Failed to process image. Please try again.', '', 4000, '/profile');
        this.loaderService.hide();
      }
    }, 'image/jpeg', 0.2); // Very low quality
  }

  // Helper method to add file to uploads
  private addFileToUploads(file: File): void {
    // Create file object and add to uploaded files
    const fileObj = {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null
    };

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      fileObj.preview = e.target.result;
      this.uploadedFiles.push(fileObj);

      // Update form control
      if (this.uploadedFiles && Array.isArray(this.uploadedFiles) && this.uploadedFiles.length > 0) {
        this.profileForm.patchValue({
          id_proof_image: this.uploadedFiles.map(f => f.file)
        });
      }

      console.log('Camera image added to upload files:', this.uploadedFiles.length);
      this.loaderService.hide();
    };
    reader.readAsDataURL(file);
  }


  updateProfile() {
    this.submitted = true;
    if (this.profileForm.invalid) {
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('first_name', this.f['full_name'].value.split(' ')[0]);
    formData.append('last_name', this.f['full_name'].value.split(' ')[1]);
    formData.append('full_name', this.f['full_name'].value);
    formData.append('email', this.f['email'].value);
    // Format phone number before submission
    let phone = this.f['phone'].value;
    if (phone && phone.length > 10) {
      phone = phone.slice(-10); // Keep only last 10 digits
    }
    formData.append('phone', phone);
    formData.append('company_name', this.f['company'].value);
    if (this.f['country'].value === 'India') {
      formData.append('pan', this.f['pan'].value);
    }
    formData.append('id_proof_type', this.f['id_proof_type'].value);
    formData.append('country', this.f['country'].value);
    formData.append('company_address', this.f['company_address'].value);
    formData.append('zipcode', this.f['zip'].value);
    formData.append('city', this.f['city'].value);
    formData.append('state', this.f['state'].value);

          // Append all files
      const idProofValue = this.f['id_proof_image'].value;
      
      // Function to check if string is an image URL
      const isImageUrl = (value: string): boolean => {
        // Check if it's a URL
        if (value.startsWith('http://') || value.startsWith('https://')) {
          // Check if it ends with common image extensions
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          return imageExtensions.some(ext => value.toLowerCase().endsWith(ext)) ||
                 value.includes('/uploads/') || // Check for upload path
                 value.includes('/images/');    // Check for images path
        }
        return false;
      };

      const isNotImageUrl = typeof idProofValue === 'string' ? !isImageUrl(idProofValue) : true;

      if (this.uploadedFiles && 
          Array.isArray(this.uploadedFiles) && 
          this.uploadedFiles.length > 0 && 
          idProofValue && 
          isNotImageUrl) {
        formData.append(`id_proof_image`, this.uploadedFiles[0].file);
    }

    this.loaderService.show();
    let url = 'user/profile-update';
    this.commonService.filepost(url, formData).subscribe(
      (response: any) => {
        this.loaderService.hide();
        console.log('Response type:', typeof response);
        console.log('Response:', response);
        this.uploadedFiles = [];

        // Handle different response types
        let responseData;
        if (response instanceof Blob) {
          // If response is a blob, try to parse it as JSON
          const reader = new FileReader();
          reader.onload = () => {
            try {
              responseData = JSON.parse(reader.result as string);
              if (responseData.code == 200) {
                this.showToast('success', responseData.message, '', 2500, '');
                // Update user name in service if form data changed
                this.profileService.updateUserName(this.f['full_name'].value);
                // Refresh profile data to get updated information
                this.getProfileData();
              } else if (responseData.code == 423) {
                this.showToast('error', responseData.message, '', 2500, '/profile');
              } else {
                this.showToast('error', responseData.message, '', 2500, '/profile');
              }
            } catch (e) {
              console.error('Error parsing blob response:', e);
              this.showToast('error', 'Invalid response format', '', 2500, '/profile');
            }
          };
          reader.readAsText(response);
        } else {
          // Handle regular JSON response
          responseData = response;
          if (responseData.code == 200) {
            this.showToast('success', responseData.message, '', 2500, '');
            // Update user name in service if form data changed
            this.profileService.updateUserName(this.f['full_name'].value);
            // Refresh profile data to get updated information
            this.getProfileData();
          } else if (responseData.code == 423) {
            this.showToast('error', responseData.message, '', 2500, '/profile');
            this.loaderService.hide();
          } else {
            this.showToast('error', responseData.message, '', 2500, '/profile');
            this.loaderService.hide();
          }
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
        this.showToast('error', 'Profile update failed', '', 2500, '/profile');
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
