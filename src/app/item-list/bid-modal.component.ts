import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonContent, 
  IonButton, 
  IonItem, 
  IonInput, 
  IonLabel, 
  IonTextarea,
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
    ReactiveFormsModule,
    IonContent, 
    IonButton, 
    IonItem, 
    IonInput, 
    IonLabel, 
    IonTextarea
  ]
})
export class BidModalComponent implements OnInit {
  @Input() item: any;
  
  public bidForm!: FormGroup;
  public submitted: boolean = false;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {

    console.log(this.item);
    // Initialize the reactive form
    this.bidForm = this.formBuilder.group({
      bid_amount: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      bid_quantity: ['', [Validators.required,Validators.min(1), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      remark: ['', [Validators.required,Validators.minLength(5),Validators.maxLength(100)]]
    });

    // Ensure modal has proper bottom spacing after initialization
    this.setModalSpacing();
  }

  // Getter for easy access to form controls
  get f() { return this.bidForm.controls; }

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
    this.submitted = true;

    // If form is invalid, don't proceed
    if (this.bidForm.invalid) {
      return;
    }

    const formValues = this.bidForm.value;
    const bidData = {
      item_id: this.item.id,
      bid_amount: parseFloat(formValues.bid_amount),
      bid_quantity: parseFloat(formValues.bid_quantity),
      actual_bid_amount: parseFloat(this.item.price),
      remark: formValues.remark
    };
    
    this.modalController.dismiss(bidData);
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