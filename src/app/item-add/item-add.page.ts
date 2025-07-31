import { Component, OnInit } from '@angular/core';
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
  ToastController
} from '@ionic/angular/standalone';
import { CommonService } from '../services/common-service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

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
    IonToast
  ]
})
export class ItemAddPage implements OnInit {
  itemForm!: FormGroup;
  selectedImages: any[] = [];
  selectedVideo: any = null;
  isSubmitting = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.itemForm = this.formBuilder.group({
      item_name: ['', [Validators.required, Validators.maxLength(60)]],
      hsn_code: ['', [Validators.required, Validators.maxLength(8), Validators.pattern(/^\d+$/)]],
      item_listed_for: ['1', Validators.required],
      uom_id: ['2', Validators.required],
      description: ['', [Validators.maxLength(255)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  get f() { return this.itemForm.controls; }

  onImageChange(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 100 * 1024) { // 100KB limit
          this.showToast('Image size should be less than 100KB', 'danger');
          continue;
        }
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push({
            file: file,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onVideoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        this.showToast('Video size should be less than 100MB', 'danger');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedVideo = {
          file: file,
          preview: e.target.result
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  removeVideo() {
    this.selectedVideo = null;
  }

  onSubmit() {
    this.submitted = true;
    if (this.itemForm.invalid) {
      return;
    }

    if (this.itemForm.valid && this.selectedImages.length > 0) {
      this.isSubmitting = true;
      
      try {
        const formData = new FormData();
        
        // Add form fields
        formData.append('item_name', this.itemForm.get('item_name')?.value);
        formData.append('hsn_code', this.itemForm.get('hsn_code')?.value);
        formData.append('item_listed_for', this.itemForm.get('item_listed_for')?.value);
        formData.append('uom_id', this.itemForm.get('uom_id')?.value);
        formData.append('description', this.itemForm.get('description')?.value || '');
        formData.append('price', this.itemForm.get('price')?.value);
        formData.append('quantity', this.itemForm.get('quantity')?.value);
        
        // Add images
        this.selectedImages.forEach((image, index) => {
          formData.append('image[]', image.file);
        });
        
        // Add video if selected
        if (this.selectedVideo) {
          formData.append('video', this.selectedVideo.file);
        }
        
        // Make API call
      //  const response = await this.commonService.filepost('items/add', formData).toPromise();
        
        this.showToast('Item added successfully!', 'success');
        this.router.navigate(['/item-list']);
        
      } catch (error: any) {
        console.error('Error adding item:', error);
        this.showToast(error.message || 'Failed to add item. Please try again.', 'danger');
      } finally {
        this.isSubmitting = false;
      }
         } else {
       // Form validation errors will be shown by the validation-error divs
       return;
     }
  }

  private showToast(message: string, color: string = 'primary') {
    this.toastService.showToast(message);
  }


}
