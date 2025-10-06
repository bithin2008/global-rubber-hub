import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PageTitleService } from '../services/page-title.service';
import { Subscription } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { register } from 'swiper/element/bundle';
import { Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AuthGuardService } from '../services/auth-guard.service';
import { BidModalComponent } from '../item-list/bid-modal.component';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { NotificationService } from '../services/notification.service';
import { LoaderService } from '../services/loader.service';


// Interfaces for type safety
interface DashboardItem {
  item_image: string[];
  item_name: string;
  company_name?: string;
  full_name?: string;
  price: string;
  item_listed_for?: number; // 1 for Sell, 2 for Buy
}

interface RubberRate {
  description: string;
  rate: string;
  rate_deviation: string;
  rate_deviation_percentage: number;
  direction: string;
}

interface DashboardData {
  rubberRates: {
    results: RubberRate[];
  };
  topSellerItems: {
    results: DashboardItem[];
  };
  topBuyerItems: {
    results: DashboardItem[];
  };
  recentListedItems: {
    results: DashboardItem[];
  };
  otherItems: {
    results: DashboardItem[];
  };
  notifications: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardPage implements OnInit, AfterViewInit {
  private subscription: Subscription = new Subscription();
  public profileName: string = '';
  public dashboardData: DashboardData = {
    rubberRates: { results: [] },
    topSellerItems: { results: [] },
    topBuyerItems: { results: [] },
    recentListedItems: { results: [] },
    otherItems: { results: [] },
    notifications: 0
  };
  // Market cards data for swiper


  // Swiper options for automatic sliding
  public swiperOptions = {
    slidesPerView: 2,
    spaceBetween: 12,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    loop: true,
    speed: 800,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 8
      },
      480: {
        slidesPerView: 2,
        spaceBetween: 10
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 12
      }
    }
  };

  constructor(
    private router: Router,
    activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    public modalController: ModalController,
    private pageTitleService: PageTitleService,
    private platform: Platform,
    private commonService: CommonService,
    private authenticationService: AuthService,
    private authGuardService: AuthGuardService,
    private notificationService: NotificationService,
    private loaderService: LoaderService
  ) {
    activatedRoute.params.subscribe(async val => {
      register();
      this.pageTitleService.setPageTitle('Dashboard');   
      this.getProfileData();
      let hasLoggin: any = await this.alreadyLoggedIn();      
      if (hasLoggin.code !== 200) {
        localStorage.clear();
        this.router.navigate(['/login']);
      } else {          
        this.getDashboardData();
        this.subscription.add(
          this.profileService.userName$.subscribe((data) => {
            if (data && typeof data === 'string' && data.trim() !== '') {
              this.profileName = data.split(' ')[0];
            } else {
              this.profileName = 'User';
            }
          })
        );

      }

    });
  }

  async ngOnInit() {
    // Check authentication on component initialization
    //  await this.authGuardService.checkTokenAndAuthenticate();

  }

  alreadyLoggedIn() {
    return new Promise((resolve) => {
      this.authenticationService.checkUserIsLoggedin().subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          console.log('error', error);
        }
      );
    });
  }

  getProfileData() {
    this.loaderService.show();
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {          
          // Update profile service with all data including wallet balance
          this.profileService.updateProfileFromAPI(response.user); 
          // Update user name in service if available
          if (response.user.full_name) {
            this.profileService.updateUserName(response.user.full_name);
          }
        } else {
          this.showToast('error', response.message, '', 3500, '');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );

  }

  goToRubberRates() {
    this.router.navigate(['/rubber-rates']);
  }

  goToLiveBids(type?: string) {
    this.router.navigate(['/item-list'], { 
      queryParams: { type: type || 'all' } 
    });
  }

  ngAfterViewInit() {
    // Initialize swiper after view is loaded
    setTimeout(() => {
      const swiperEl = document.querySelector('swiper-container');
      if (swiperEl) {
        console.log('Found swiper element, initializing...');
        console.log('Data available:', this.dashboardData.rubberRates.results?.length || 0);

        // Initialize the swiper
        swiperEl.initialize();

        console.log('✅ Swiper initialized with direct attributes');

        // Wait for swiper to be fully initialized
        setTimeout(() => {
          if (swiperEl.swiper) {
            console.log('Swiper instance created successfully');
            console.log('Current slidesPerView:', swiperEl.swiper.params.slidesPerView);
            console.log('Total slides:', swiperEl.swiper.slides?.length || 0);

            // Force update to ensure proper rendering
            swiperEl.swiper.update();
            console.log('Swiper updated');

            // Additional force refresh after a delay
            setTimeout(() => {
              if (swiperEl.swiper) {
                swiperEl.swiper.update();
                console.log('Swiper force refreshed');
              }
            }, 1000);
          } else {
            console.error('Swiper instance not found');
          }
        }, 300);
      } else {
        console.error('Swiper container element not found');
      }
    }, 500);

    // Additional initialization after data loads
    setTimeout(() => {
      const swiperEl = document.querySelector('swiper-container');
      if (swiperEl && swiperEl.swiper) {
        console.log('Re-initializing swiper after data load');
        swiperEl.swiper.update();
      }
    }, 3000);
  }

 


  getDashboardData() {
    this.loaderService.show();
    let url = `user/dashboard`;
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          // Safely assign the response data with proper typing
          this.dashboardData = {
            rubberRates: response.rubberRates || { results: [] },
            topSellerItems: response.topSellerItems || { results: [] },
            topBuyerItems: response.topBuyerItems || { results: [] },
            recentListedItems: response.recentListedItems || { results: [] },
            otherItems: response.otherItems || { results: [] },
            notifications: response.notifications || 0
          };

          // Update notification service with the latest notifications
          if (response.notifications) {
            this.notificationService.updateNotifications(response.notifications);
          };
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error', error);
        // Set default data on error
        this.dashboardData = {
          rubberRates: { results: [] },
          topSellerItems: { results: [] },
          topBuyerItems: { results: [] },
          recentListedItems: { results: [] },
          otherItems: { results: [] },
          notifications: 0
        };
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

  // Open bid modal
  async openBidModal(item: any) {
    item.isEdit = true;
    const modal = await this.modalController.create({
      component: BidModalComponent,
      componentProps: {
        item: item
      },
      cssClass: 'bid-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Handle the bid submission
        console.log('Bid submitted:', result.data);
        // Optionally refresh dashboard data after successful bid
        this.getDashboardData();
      }
    });

    return await modal.present();
  }

}
