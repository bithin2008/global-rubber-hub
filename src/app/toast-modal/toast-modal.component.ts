import { Component, OnInit, Input, } from '@angular/core';
import { MenuController, NavController, NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-toast-modal',
  templateUrl: './toast-modal.component.html',
  styleUrls: ['./toast-modal.component.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule,  IonicModule ]
})
export class ToastModalComponent implements OnInit {
  @Input() status!: string;
  @Input() message!: string;
  @Input() submessage!: string;
  @Input() timer!: number;
  @Input() redirect!: string;
  defaultLanguage: any = 'beng';
  constructor(navParams: NavParams, private navCtrl: NavController, public router: Router,private modalController: ModalController ) {
    console.log(navParams.get('status'));
    console.log(navParams.get('message'));
    console.log(navParams.get('submessage'));
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
