import { Component, OnInit } from '@angular/core';
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
  constructor(  public router: Router,) { }

  ngOnInit() {
    // setTimeout(() => {
    //   this.router.navigate(['/dashboard'])
    // }, 4000);
 
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
