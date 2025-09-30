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
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { LoaderService } from '../services/loader.service';

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
    IonTextarea,
    IonSpinner
  ]
})
export class BidModalComponent implements OnInit {
  @Input() item: any;

  public bidForm!: FormGroup;
  public submitted: boolean = false;
  public isEdit: boolean = false;
  public isSubmitting: boolean = false; // Variable to control button loader

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {

    console.log(this.item);

    // Check if this is an edit mode (item has bid_quantity and bid_amount values)
   // if (this.item && this.item.bid_quantity && this.item.bid_amount) {
      this.isEdit = this.item.isEdit ;
   // }


  

    // Initialize the reactive form
    const maxAllowedQuantity = Number(this.item?.in_stock ?? Number.MAX_SAFE_INTEGER);

    this.bidForm = this.formBuilder.group({
      bid_amount: [this.item.bid_amount?this.item.bid_amount:null ,[Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      bid_quantity: [
        this.item.bid_quantity? this.item.bid_quantity: null,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(maxAllowedQuantity),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]
      ],
      remark: [this.isEdit?this.item.description:'', [Validators.maxLength(150)]]
    });

    // Note: Fields are made readonly via HTML [readonly] attribute when isEdit is true

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

    // Set loading state
    this.isSubmitting = true;

    const formValues = this.bidForm.value;
    const bidData = {
      item_id: this.item.id,
      bid_amount: parseFloat(formValues.bid_amount),
      bid_quantity: parseFloat(formValues.bid_quantity),
      actual_bid_amount: parseFloat(this.item.price),
      remark: formValues.remark
    };

    let url = 'bids/add';
    let data:any = {
      item_id: bidData.item_id,
      bid_amount: bidData.bid_amount,
      bid_quantity: bidData.bid_quantity,
      actual_bid_amount: this.item.actual_bid_amount? this.item.actual_bid_amount: bidData.actual_bid_amount,
      remark: bidData.remark,
      cancel_rejection_reason: null
    }
    if(this.isEdit){
      data.id = this.item.id;
    }
    
    this.commonService.filepost(url, data).subscribe(
      (response: any) => {
        this.isSubmitting = false; // Stop loading
        this.loaderService.hide();
        if (response.code == 200) {
          this.showToast('success', response.message, '', 2500, '');
          this.modalController.dismiss(bidData);
        } else {
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
        this.isSubmitting = false; // Stop loading
        this.loaderService.hide();
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );


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

  async showToast(
    status: string,
    message: string,
    submessage: string,
    timer: number,
    redirect: string
  ) {
    const modal = await this.modalController.create({
      component: ToastModalComponent,
      cssClass: 'toast-modal',
      componentProps: {
        status: status,
        message: message,
        submessage: submessage,
        timer: timer,
        redirect: redirect
      }
    });
    return await modal.present();
  }
} 