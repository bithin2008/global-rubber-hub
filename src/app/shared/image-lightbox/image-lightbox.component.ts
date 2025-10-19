import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, ModalController } from '@ionic/angular/standalone';
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-image-lightbox',
  templateUrl: './image-lightbox.component.html',
  styleUrls: ['./image-lightbox.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageLightboxComponent implements OnInit {
  @Input() images: string[] = [];
  @Input() startIndex: number = 0;
  public fallbackImg: string = 'https://globalrubberhub.com/public/backend/assets/images/default_item_image.jpeg';
  constructor(private modalController: ModalController) {}

  ngOnInit(): void {
    register();
  }

  dismiss(): void {
    this.modalController.dismiss();
  }

  onThumbnailError(event: Event) {
    const target = event.target as HTMLImageElement | null;
    if (target && target.src !== this.fallbackImg) {
      target.src = this.fallbackImg;
    }
  }
}


