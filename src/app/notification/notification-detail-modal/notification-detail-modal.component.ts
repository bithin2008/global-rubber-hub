import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-notification-detail-modal',
  templateUrl: './notification-detail-modal.component.html',
  styleUrls: ['./notification-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TimeAgoPipe]
})
export class NotificationDetailModalComponent {
  @Input() notification: any;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
