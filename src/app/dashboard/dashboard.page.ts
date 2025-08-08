import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PageTitleService } from '../services/page-title.service';
import { Subscription } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { register } from 'swiper/element/bundle';
import { Platform } from '@ionic/angular';


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
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [ IonicModule, FormsModule, ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent ],
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
    recentListedItems: { results: [] }
  };
  // Market cards data for swiper
  public marketCards = [
    {
      name: 'Natural Rubber',
      price: '25,195.80',
      change: '+113.80',
      percentage: '0.45%',
      direction: 'up'
    },
    {
      name: 'Synthetic Rubber',
      price: '18,750.50',
      change: '-245.30',
      percentage: '1.29%',
      direction: 'down'
    },
    {
      name: 'Butyl Rubber',
      price: '32,450.75',
      change: '+567.20',
      percentage: '1.78%',
      direction: 'up'
    },
    {
      name: 'Neoprene Rubber',
      price: '28,900.25',
      change: '-89.45',
      percentage: '0.31%',
      direction: 'down'
    },
    {
      name: 'EPDM Rubber',
      price: '22,150.90',
      change: '+334.60',
      percentage: '1.53%',
      direction: 'up'
    },
    {
      name: 'Nitrile Rubber',
      price: '19,875.40',
      change: '-156.80',
      percentage: '0.78%',
      direction: 'down'
    }
  ];

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
    private profileService: ProfileService,
    private pageTitleService: PageTitleService,
    private platform: Platform,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    // Register Swiper elements
    register();
    this.getDashboardData();
    // Set the page title when the page loads
    this.pageTitleService.setPageTitle('Dashboard');
    this.subscription.add(
      this.profileService.userName$.subscribe((data) => {
        if (data && typeof data === 'string' && data.trim() !== '') {
          this.profileName = data.split(' ')[0];
        } else {
          this.profileName = 'User';
        }
      })
    );
    
    // Add fallback data for testing if no data from API
    setTimeout(() => {
      if (!this.dashboardData.rubberRates.results || this.dashboardData.rubberRates.results.length === 0) {
        console.log('No data from API, using fallback data for Swiper testing');
        this.dashboardData.rubberRates.results = [
          {
            description: 'Natural Rubber',
            rate: '25,195.80',
            rate_deviation: '+113.80',
            rate_deviation_percentage: 0.45,
            direction: 'up'
          },
          {
            description: 'Synthetic Rubber',
            rate: '18,750.50',
            rate_deviation: '-245.30',
            rate_deviation_percentage: -1.29,
            direction: 'down'
          },
          {
            description: 'Butyl Rubber',
            rate: '32,450.75',
            rate_deviation: '+567.20',
            rate_deviation_percentage: 1.78,
            direction: 'up'
          },
          {
            description: 'Neoprene Rubber',
            rate: '28,900.25',
            rate_deviation: '-89.45',
            rate_deviation_percentage: -0.31,
            direction: 'down'
          }
        ];
      }
    }, 2000);
  }

  goToLiveBids(){
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
            recentListedItems: response.recentListedItems || { results: [] }
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
          recentListedItems: { results: [] }
        };
      }
    );
  }




}
