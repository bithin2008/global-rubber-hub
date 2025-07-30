import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonButtons, 
  IonItem, 
  IonInput, 
  IonLabel, 
  IonTextarea,
  IonIcon,
  ModalController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-bid-modal',
  templateUrl: './bid-modal.component.html',
  styleUrls: ['./bid-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonButtons, 
    IonItem, 
    IonInput, 
    IonLabel, 
    IonTextarea,
    IonIcon
  ]
})
export class BidModalComponent {
  @Input() item: any;
  
  bidAmount: number = 0;
  bidMessage: string = '';

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  submitBid() {
    if (this.bidAmount > 0) {
      const bidData = {
        itemId: this.item.id,
        bidAmount: this.bidAmount,
        bidMessage: this.bidMessage
      };
      this.modalController.dismiss(bidData);
    }
  }

  // Prevent modal from being dismissed when clicking inside content
  onContentClick(event: Event) {
    event.stopPropagation();
  }
} 