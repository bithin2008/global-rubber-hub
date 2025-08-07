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
declare var StatusBar: any;

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
  
  };

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private pageTitleService: PageTitleService,
    private platform: Platform
  ) { }

  ngOnInit() {
    // Register Swiper elements
    register();
    
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
    if (this.platform.is('cordova')) {
      // Configure StatusBar color
      StatusBar.backgroundColorByHexString('#1a8135');
      StatusBar.styleDefault();
    }
  }

  goToLiveBids(){
    this.router.navigate(['/item-list']);
  }

  ngAfterViewInit() {
    // Initialize swiper after view is loaded
    setTimeout(() => {
      const swiperEl = document.querySelector('swiper-container');
      if (swiperEl) {
        Object.assign(swiperEl, this.swiperOptions);
        swiperEl.initialize();
        console.log('✅ Swiper initialized with autoplay');
        
        // Ensure autoplay is working
        setTimeout(() => {
          if (swiperEl.swiper && swiperEl.swiper.autoplay) {
            swiperEl.swiper.autoplay.start();
            console.log('🚀 Autoplay started');
          }
        }, 500);
      }
    }, 200);
  }







}
