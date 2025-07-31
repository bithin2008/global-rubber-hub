import { Component, Input, OnInit } from '@angular/core';
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
export class BidModalComponent implements OnInit {
  @Input() item: any;
  
  bidAmount: number = 0;
  bidMessage: string = '';

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    // Ensure modal has proper bottom spacing after initialization
    this.setModalSpacing();
  }

  private setModalSpacing() {
    // Add a small delay to ensure modal is rendered
    setTimeout(() => {
      const modalElement = document.querySelector('ion-modal.bid-modal') as HTMLElement;
      if (modalElement) {
        modalElement.style.setProperty('--bottom', '20px');
      }
    }, 100);
  }

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

  // Convert UOM ID to display text
  getUOMText(uomId: number): string {
    switch (uomId) {
      case 2:
        return 'KGS';
      case 23:
        return 'QUINTAL';
      case 27:
        return 'TON';
      default:
        return '';
    }
  }
} 