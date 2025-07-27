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
  status!: string;
  message!: string;
  submessage!: string;
  timer!: number;
  redirect!: string;
  defaultLanguage: any = 'beng';
  constructor(navParams: NavParams, private navCtrl: NavController, public router: Router,private modalController: ModalController ) {
    // Get values from componentProps
    this.status = navParams.get('status') || '';
    this.message = navParams.get('message') || '';
    this.submessage = navParams.get('submessage') || '';
    this.timer = navParams.get('timer') || 3000;
    this.redirect = navParams.get('redirect') || '';
    
    console.log('Status:', this.status);
    console.log('Message:', this.message);
    console.log('Submessage:', this.submessage);
  }

  ngOnInit() {
    this.defaultLanguage = localStorage.getItem('language');
    setTimeout(() => {
      this.modalController.dismiss();
      if (this.redirect != "") {
        //  this.router.navigate([this.redirect]);
        if (this.redirect == '/dashboard') {
          this.navCtrl.navigateRoot([this.redirect], { replaceUrl: true })
        } else {
          this.navCtrl.navigateRoot([this.redirect])
        }

      }
    }, this.timer);



  }

}
