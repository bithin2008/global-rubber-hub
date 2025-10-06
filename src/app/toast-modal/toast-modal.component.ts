import { Component, OnInit, Input, } from '@angular/core';
import { MenuController, NavController, NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-toast-modal',
  templateUrl: './toast-modal.component.html',
  styleUrls: ['./toast-modal.component.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonicModule ]
})
export class ToastModalComponent implements OnInit {
  @Input() status!: string;
  @Input() message!: string;
  @Input() submessage!: string;
  @Input() timer!: number;
  @Input() redirect!: string;
  defaultLanguage: any = 'beng';
  constructor(private navCtrl: NavController, public router: Router, private modalController: ModalController ) {
    // Component props will be set via @Input decorators
  }

  ngOnInit() {
    this.defaultLanguage = localStorage.getItem('language');
    
    // Set default timer if not provided
    const timerDuration = this.timer || 3000;
    
    console.log('ToastModal - Status:', this.status);
    console.log('ToastModal - Message:', this.message);
    console.log('ToastModal - Timer:', timerDuration);
    
    setTimeout(() => {
      console.log('ToastModal - Auto-dismissing after', timerDuration, 'ms');
      this.modalController.dismiss();
      if (this.redirect && this.redirect !== "") {
        if (this.redirect == '/dashboard') {
          this.navCtrl.navigateRoot([this.redirect], { replaceUrl: true })
        } else {
          this.navCtrl.navigateRoot([this.redirect])
        }
      }
    }, timerDuration);
  }

}
