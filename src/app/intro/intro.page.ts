import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicSlides} from '@ionic/angular/standalone';
import { register } from 'swiper/element/bundle';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
  constructor() { }

  ngOnInit() {
  }

}
