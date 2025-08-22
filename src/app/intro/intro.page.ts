import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicSlides} from '@ionic/angular/standalone';
import { register } from 'swiper/element/bundle';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

register();

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IntroPage implements OnInit {
  swiperModules = [IonicSlides];
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  
  constructor(public router: Router) { }

  ngOnInit() {
    this.initializeSwiper();
  }

  ngAfterViewInit() {
    this.initializeSwiper();
  }

  initializeSwiper() {
    setTimeout(() => {
      const swiperEl = this.swiperContainer?.nativeElement;
      if (swiperEl) {
        // Configure Swiper
        Object.assign(swiperEl, {
          slidesPerView: 1,
          centeredSlides: true,
          spaceBetween: 12,
          pagination: {
            clickable: true,
            dynamicBullets: false
          },
          on: {
            init() {
              console.log('Swiper initialized');
            },
            slideChange() {
              console.log('Slide changed');
            }
          }
        });

        // Initialize Swiper
        swiperEl.initialize();
      }
    }, 100);
  }

  goToLogin() {
    localStorage.setItem('has_intro', 'yes')
    this.router.navigate(['/login']);
  }


}
