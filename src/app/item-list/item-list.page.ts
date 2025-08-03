import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonList, IonButton, IonIcon, IonCardContent, IonImg, IonButtons, IonItem, IonSelect, IonSelectOption, IonInput, IonInfiniteScroll, IonInfiniteScrollContent, ModalController } from '@ionic/angular/standalone';
import { BidModalComponent } from './bid-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, MenuController, PopoverController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common-service';
import * as _ from 'lodash';
import { register } from 'swiper/element/bundle';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.page.html',
  styleUrls: ['./item-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, CommonModule, NgIf, NgFor, FormsModule, IonCard, IonButton, IonCardContent, IonButtons, IonItem, IonSelect, IonSelectOption, IonInput, IonInfiniteScroll, IonInfiniteScrollContent, HeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ItemListPage implements OnInit {
  public filterWarning: boolean = false;
  public itemList: any = [];
  public itemFilterList: any = [];
  public enableLoader: boolean = false;
  public hasLoggin: any = {};
  public showNoRecord: boolean = false;
  public page: number = 0;
  public pageSize: number = 10;
  public totalCount: number = 0;
  public searchKeyword: string = '';
  public searchField: any = 5;
  public orderBy: string = 'desc';
  constructor(
    public router: Router,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private menu: MenuController,
    private commonService: CommonService,
    private popoverController: PopoverController,
    private authenticationService: AuthService,
    // private sharedService: SharedService,
  ) {
    // Register Swiper custom elements
    register();

    // this.activatedRoute.params.subscribe(async val => {

    //   this.hasLoggin = await this.isLoggedIn();
    //   if (this.hasLoggin.status == 200) {
    //     this.itemList = [];
    //     this.page = 0;
    //     this.sharedService.updateUserProfile(this.hasLoggin);
    //     this.getItemFilterList();
    //     this.getItemList();
    //   }
    // });

    //  this.getItemFilterList();
    this.getItemList();
  }

  ngOnInit() {
  }

  goToAddItem(){
    this.router.navigate(['/item-add']);
  }

  getItemList() {
    let data = {
      module: 1,
      start: this.page,
      limit: 10,
      order_field: this.searchField==5 ? 'item_master.added_on':this.searchField,
      order_by: this.orderBy,
      keyword: this.searchKeyword ? this.searchKeyword : '',
      options:  this.searchField==5 ? 'item_master.added_on':this.searchField

    }
    if (this.page == 0) {
      this.enableLoader = true;
    }
    let url = `items/list`;
    this.commonService.post(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.itemList = this.itemList.concat(response.results);
          this.itemList = _.uniqBy(this.itemList, 'id');
          this.totalCount = response.total_count;
          if (this.itemList.length > 0) {
            this.showNoRecord = false;
          }
          else {
            this.showNoRecord = true;
          }

        }
      },
      (error) => {
        this.enableLoader = false;

        console.log('error', error);
      }
    );
  }

  loadData(event: any) {
    setTimeout(() => {

      if (this.totalCount != this.itemList.length) {
        this.page += 10;
        this.getItemList();
      }
      event.target.complete();
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.totalCount == this.itemList.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  searchItem(event: any) {
    if (!this.searchField) {
      this.filterWarning = true;
    } else {
      if (this.searchKeyword.length > 2) {
        this.page = 0;
        this.itemList = [];
        this.getItemList();
      }
    }

    if (event.keyCode === 8 || event.keyCode === 46) {
      if (this.searchKeyword.length == 0) {
        this.page = 0;
        this.itemList = [];
        this.getItemList();
      }
    }
  }

  selectFilter(event: any) {
    if (this.searchField) {
      this.filterWarning = false;
    }
    
    // Update current filter value
    this.searchField = event;
    
    // Switch case based on dropdown value
    switch (event) {
      case 1: // Price (Low to High)
        this.searchField = 'item_master.price';
        this.orderBy = 'asc';
        console.log('Filtering by Price (Low to High)');
        break;
        
      case 2: // Price (High to Low)
        this.searchField = 'item_master.price';
        this.orderBy = 'desc';
        console.log('Filtering by Price (High to Low)');
        break;
        
      case 3: // Quantity (Low to High)
        this.searchField = 'item_master.quantity';
        this.orderBy = 'asc';
        console.log('Filtering by Quantity (Low to High)');
        break;
        
      case 4: // Quantity (High to Low)
        this.searchField = 'item_master.quantity';
        this.orderBy = 'desc';
        console.log('Filtering by Quantity (High to Low)');
        break;
        
      case 5: // Most Recent
        this.searchField = 'item_master.added_on';
        this.orderBy = 'desc';
        console.log('Filtering by Most Recent');
        break;
        
      default:
        this.searchField = 'item_master.price';
        this.orderBy = 'asc';
        console.log('Default filter: Price (Low to High)');
        break;
    }
    
    this.page = 0;
    this.itemList = [];
    this.getItemList();
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

  // Get filter display text based on selected value
  getFilterDisplayText(filterValue: number): string {
    switch (filterValue) {
      case 1:
        return 'Price (Low to High)';
      case 2:
        return 'Price (High to Low)';
      case 3:
        return 'Quantity (Low to High)';
      case 4:
        return 'Quantity (High to Low)';
      case 5:
        return 'Most Recent';
      default:
        return 'Select Filter';
    }
  }

  // Get current filter value for display
  getsearchField(): number {
    if (!this.searchField) return 0;
    
    if (this.searchField === 'item_master.price') {
      return this.orderBy === 'asc' ? 1 : 2;
    } else if (this.searchField === 'item_master.quantity') {
      return this.orderBy === 'asc' ? 3 : 4;
    } else if (this.searchField === 'item_master.added_on') {
      return 5;
    }
    
    return 0;
  }

  // Open bid modal
  async openBidModal(item: any) {
    const modal = await this.modalController.create({
      component: BidModalComponent,
      componentProps: {
        item: item
      },
      cssClass: 'bid-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Handle the bid submission
        console.log('Bid submitted:', result.data);
        // You can add your bid submission logic here
        this.handleBidSubmission(result.data);
      }
    });

    return await modal.present();
  }



  // Handle bid submission (you can customize this method)
  handleBidSubmission(bidData: any) {
    console.log('Processing bid:', bidData);
    let url = 'bids/add';
      let data={
          item_id: bidData.item_id,
          bid_amount: bidData.bid_amount,
          bid_quantity: bidData.bid_quantity,
          actual_bid_amount: bidData.actual_bid_amount,
          remark: bidData.remark,
          cancel_rejection_reason: null
        
      }
    //this.enableLoader = true;
    this.commonService.filepost(url, data).subscribe(
      (response: any) => {
      //  this.enableLoader = false;
        if (response.code == 200) {
          this.showToast('success', response.message, '', 2500, '');
        } else {
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
      //  this.enableLoader = false;
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );
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
