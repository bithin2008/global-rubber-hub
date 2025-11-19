import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonTextarea,
  IonSpinner,
  IonIcon,
  ModalController
} from '@ionic/angular/standalone';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { LoaderService } from '../services/loader.service';
import { Subscription } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { register } from 'swiper/element/bundle';
import { ImageLightboxComponent } from '../shared/image-lightbox/image-lightbox.component';
import { ShareModalComponent } from '../shared/share-modal/share-modal.component';
@Component({
  selector: 'app-bid-modal',
  templateUrl: './bid-modal.component.html',
  styleUrls: ['./bid-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonInput,
    IonLabel,
    IonTextarea,
    IonSpinner,
    IonIcon
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BidModalComponent implements OnInit {
  @Input() item: any;
  private subscription: Subscription = new Subscription();
  public bidForm!: FormGroup;
  public submitted: boolean = false;
  public isEdit: boolean = false;
  public isSubmitting: boolean = false; // Variable to control button loader
  public profileData: any = null; // Store the complete profile data
  public fallbackImg: string = 'https://globalrubberhub.com/public/backend/assets/images/default_item_image.jpeg';

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private loaderService: LoaderService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {

    console.log(this.item);

    // Register swiper
    register();

    // Initialize swiper event listeners after view is ready
    setTimeout(() => {
      this.initializeSwiperEvents();
    }, 1000);

    // Check if this is an edit mode (item has bid_quantity and bid_amount values)
   // if (this.item && this.item.bid_quantity && this.item.bid_amount) {
      this.isEdit = this.item.isEdit ;
   // }
   // Check if profile data is already available
   const currentProfile = this.profileService.getCurrentCompleteProfile();
   if (currentProfile) {
     this.profileData = currentProfile;
     console.log('Complete profile data (from service): ', this.profileData);
   } else {
     console.log('No profile data available, loading...');
     // Load profile data if not available
     this.loadProfileData();
   }

   

  

    // Initialize the reactive form
    const maxAllowedQuantity = Number(this.item?.remaining_stock ?? Number.MAX_SAFE_INTEGER);

    this.bidForm = this.formBuilder.group({
      bid_amount: [this.item.bid_amount?this.item.bid_amount:null ,[Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      bid_quantity: [
        this.item.bid_quantity? this.item.bid_quantity: null,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(maxAllowedQuantity),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]
      ],
      remark: [this.isEdit?this.item.remark?this.item.remark:this.item.description:'', [Validators.maxLength(150)]]
    });

    // Note: Fields are made readonly via HTML [readonly] attribute when isEdit is true

    // Ensure modal has proper bottom spacing after initialization
    this.setModalSpacing();
  }

  // Getter for easy access to form controls
  get f() { return this.bidForm.controls; }

  loadProfileData() {
    this.loaderService.show();
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          // Update profile service with all data including wallet balance
         // this.profileService.updateProfileFromAPI(response.user);
          this.profileData = response.user;
          console.log('Profile data loaded successfully: ', this.profileData);
        } else {
          console.error('Failed to load profile data:', response.message);
        }
      },
      (error) => {
        this.loaderService.hide();
        console.error('Error loading profile data:', error);
      }
    );
  }

  private setModalSpacing() {
    // Add a small delay to ensure modal is rendered
    setTimeout(() => {
      const modalElement = document.querySelector('ion-modal.bid-modal') as HTMLElement;
      if (modalElement) {
        modalElement.style.setProperty('--bottom', '20px');
      }
      
      // Scroll content to top to ensure header is visible
      const contentElement = document.querySelector('ion-content.modal-content') as any;
      if (contentElement) {
        contentElement.scrollToTop(0);
      }
    }, 100);
  }


  dismiss() {
    this.modalController.dismiss();
  }

  submitBid() {
    this.submitted = true;

    // If form is invalid, don't proceed
    if (this.bidForm.invalid) {
      return;
    }

    // Set loading state
    this.isSubmitting = true;

    const formValues = this.bidForm.value;
    const bidData = {
      item_id: this.isEdit? this.item.item_id?this.item.item_id: this.item.id:this.item.id,
      bid_amount: parseFloat(formValues.bid_amount),
      bid_quantity: parseFloat(formValues.bid_quantity),
      actual_bid_amount: parseFloat(this.item.price),
      remark: formValues.remark
    };

    let url = 'bids/add';
    let data:any = {
      item_id: bidData.item_id,
      bid_amount: bidData.bid_amount,
      bid_quantity: bidData.bid_quantity,
      actual_bid_amount: this.item.actual_bid_amount? this.item.actual_bid_amount: bidData.actual_bid_amount,
      remark: bidData.remark,
      cancel_rejection_reason: null,
      added_by: this.profileData.id,
      bid_status: 0,
    }
    if(this.isEdit){
      data.id = this.item.id;
    }
    
    this.commonService.filepost(url, data).subscribe(
      (response: any) => {
        this.isSubmitting = false; // Stop loading
        this.loaderService.hide();
        if (response.code == 200) {
          this.showToast('success', response.message, '', 2500, '');
          this.modalController.dismiss(bidData);
        } else {
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
        this.isSubmitting = false; // Stop loading
        this.loaderService.hide();
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );


  }

  // Convert UOM ID to display text
  getUOMText(uomId: number): string {
    switch (uomId) {
      case 2:
        return 'KGS';
      case 23:
        return 'QUINTAL';
      case 27:
        return 'TON';
      default:
        return '';
    }
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

  initializeSwiperEvents() {
    // Add event listeners to all swiper containers
    const swiperContainers = document.querySelectorAll('swiper-container');
    swiperContainers.forEach((container: any) => {
      container.addEventListener('slidechange', (event: any) => {
        this.handleSlideChange(event);
      });
    });
  }

  handleSlideChange(event: any) {
    const swiper = event.detail[0];
    const activeIndex = swiper.activeIndex;
    const slides = swiper.slides;
    
    // Pause all videos first
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((video: HTMLVideoElement) => {
      video.pause();
    });
    
    // For video slides, we just pause them since we use play button overlay
    // No automatic playing since user needs to click the play button
  }

  async openLightbox(images: string[], startIndex: number = 0) {
    const modal = await this.modalController.create({
      component: ImageLightboxComponent,
      componentProps: { images, startIndex },
      cssClass: 'image-lightbox-modal'
    });
    return await modal.present();
  }

  async openVideoLightbox(videoUrl: string) {
    const modal = await this.modalController.create({
      component: ImageLightboxComponent,
      componentProps: { 
        images: [videoUrl], 
        startIndex: 0,
        isVideo: true 
      },
      cssClass: 'video-lightbox-modal'
    });
    return await modal.present();
  }

  onThumbnailError(event: Event) {
    const target = event.target as HTMLImageElement | null;
    if (target && target.src !== this.fallbackImg) {
      target.src = this.fallbackImg;
    }
  }

  onVideoError(event: Event) {
    console.log('Video failed to load:', event);
    // You can add fallback handling here if needed
  }

  isTrustedValid(item: any): boolean {
    if (!item || item.is_trusted !== 1) {
      return false;
    }

    if (!item.trusted_package_expiry) {
      return false;
    }

    const expiryDate = new Date(item.trusted_package_expiry);
    const currentDate = new Date();

    return expiryDate > currentDate;
  }

  // Share functionality using custom modal
  async shareItem(item: any) {
    try {
      if (!item || !item.item_image || item.item_image.length === 0) {
        console.error('Item or item images not available for sharing');
        return;
      }

      // Prepare share data
      const blob = await fetch(item.item_image[0]).then(res => res.blob());
      const file = new File([blob], "item.jpg", { type: blob.type });
      const shareData = {
        title: `${item.item_name} for ${item.item_listed_for == 1 ? 'Sale' : 'Buy'}  ${item.city ? 'in ' + item.city : ''}`,
        text: `Check out this ${item.item_name} - ${item.description || 'Available now!'}`,
        files: [file],
        url: item.item_share_url
      };

      const modal = await this.modalController.create({
        component: ShareModalComponent,
        componentProps: { shareData },
        cssClass: 'share-modal'
      });

      return await modal.present();
    } catch (error) {
      console.error('Error sharing item:', error);
    }
  }
} 