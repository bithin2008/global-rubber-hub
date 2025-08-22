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
  ToastController
} from '@ionic/angular/standalone';
import { CommonService } from '../services/common-service';
import { ToastService } from '../services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PageTitleService } from '../services/page-title.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toastService: ToastService,
    private router: Router,
    public modalController: ModalController,
    private pageTitleService: PageTitleService,
    private authGuardService: AuthGuardService,
    private activatedRoute: ActivatedRoute
  ) { }

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

  onImageChange(event: any) {
    const files = event.target.files;
    console.log('Image change event:', files);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('Processing file:', file.name, file.type, file.size);

        // Validate file type
        if (!file.type.startsWith('image/')) {
          this.showToast('danger', 'Please select only image files', '', 2500, '/login');
          continue;
        }

        // Validate file size (2MB limit)
        if (file.size > 2000 * 1024) {
          this.showToast('danger', 'Image size should be less than 2MB', '', 2500, '/login');
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
