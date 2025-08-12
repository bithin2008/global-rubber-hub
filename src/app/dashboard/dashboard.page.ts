import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PageTitleService } from '../services/page-title.service';
import { Subscription } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { register } from 'swiper/element/bundle';
import { Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AuthGuardService } from '../services/auth-guard.service';


// Interfaces for type safety
interface DashboardItem {
  item_image: string[];
  item_name: string;
  company_name?: string;
  full_name?: string;
  price: string;
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
  public enableLoader: boolean = false;
  private subscription: Subscription = new Subscription();
  public profileName: string = '';
  public dashboardData: DashboardData = {
    rubberRates: { results: [] },
    topSellerItems: { results: [] },
    topBuyerItems: { results: [] },
    recentListedItems: { results: [] },
    otherItems: { results: [] }
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
    private pageTitleService: PageTitleService,
    private platform: Platform,
    private commonService: CommonService,
    private authenticationService: AuthService,
    private authGuardService: AuthGuardService
  ) {
    activatedRoute.params.subscribe(async val => {
      let hasLoggin: any = await this.alreadyLoggedIn();
      if (hasLoggin.code !== 200) {
        localStorage.clear();
        this.router.navigate(['/login']);
      } else {
        this.pageTitleService.setPageTitle('Dashboard');
        register();
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

  goToLiveBids() {
    this.router.navigate(['/item-list']);
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
    this.enableLoader = true;
    let url = `user/dashboard`;
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          // Safely assign the response data with proper typing
          this.dashboardData = {
            rubberRates: response.rubberRates || { results: [] },
            topSellerItems: response.topSellerItems || { results: [] },
            topBuyerItems: response.topBuyerItems || { results: [] },
            recentListedItems: response.recentListedItems || { results: [] },
            otherItems: response.otherItems || { results: [] }
          };
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error', error);
        // Set default data on error
        this.dashboardData = {
          rubberRates: { results: [] },
          topSellerItems: { results: [] },
          topBuyerItems: { results: [] },
          recentListedItems: { results: [] },
          otherItems: { results: [] }
        };
      }
    );
  }




}
