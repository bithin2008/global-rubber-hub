import { Component, OnInit } from '@angular/core';
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
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import { CommonService } from '../services/common-service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
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
    HeaderComponent,
    FooterComponent
  ]
})
export class ItemAddPage implements OnInit {
  itemForm!: FormGroup;
  selectedImages: any[] = [];
  selectedVideo: any = null;
  isSubmitting = false;
  submitted = false;
  enableLoader = false;
  profileDetails: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private toastService: ToastService,
    private router: Router,
    public modalController: ModalController,
    private pageTitleService: PageTitleService,
    private authGuardService: AuthGuardService
  ) { }

  async ngOnInit() {
    // Check authentication on component initialization
    await this.authGuardService.checkTokenAndAuthenticate();
    
    this.pageTitleService.setPageTitle('Add Item');
    this.initForm();
  }

  initForm() {
    this.itemForm = this.formBuilder.group({
      id: ['', []], // Empty for adding new item
      item_name: ['', [Validators.required, Validators.maxLength(60)]],
      hsn_code: ['', [Validators.required, Validators.maxLength(8), Validators.pattern(/^\d+$/)]],
      item_listed_for: ['1', Validators.required],
      uom_id: ['2', Validators.required],
      description: ['', [Validators.maxLength(255)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ['', [Validators.required, Validators.min(0.01)]]
    });
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

  get f() { return this.itemForm.controls; }

  onImageChange(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          this.showToast('danger', 'Please select only image files', '', 2500, '/login');
          continue;
        }

        // Validate file size (2MB limit)
        if (file.size > 2000 * 1024) {
          this.showToast('danger', 'Image size should be less than 100KB', '', 2500, '/login');
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
      // Validate file type
      if (!file.type.startsWith('video/')) {
        // this.showToast('Please select only video files', 'danger');
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
    const formData = new FormData();

    // Add form fields
    // formData.append('id', this.itemForm.get('id')?.value || '');
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

    let url = 'items/add';

    this.enableLoader = true;
    this.commonService.filepost(url, formData).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.showToast('success', response.message, '', 2500, '/item-list');
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
