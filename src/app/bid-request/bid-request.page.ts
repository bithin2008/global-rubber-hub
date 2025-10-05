import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthGuardService } from '../services/auth-guard.service';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonList, IonButton, IonLabel, IonIcon, IonAvatar, IonCardContent, IonImg, IonButtons, IonItem, IonSelect, IonSelectOption, IonInput, IonInfiniteScroll, IonInfiniteScrollContent, ModalController, AlertController } from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuController, PopoverController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common-service';
import * as _ from 'lodash';
import { register } from 'swiper/element/bundle';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PageTitleService } from '../services/page-title.service';
import { RejectReasonModalComponent } from './reject-reason-modal/reject-reason-modal.component';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-bid-request',
  templateUrl: './bid-request.page.html',
  styleUrls: ['./bid-request.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonIcon, IonLabel, IonAvatar, CommonModule, FormsModule, IonCard, IonButton, IonCardContent, IonButtons, IonItem, IonSelect, IonSelectOption, IonInput, IonInfiniteScroll, IonInfiniteScrollContent, HeaderComponent, FooterComponent],
})
export class BidRequestPage implements OnInit {

  public filterWarning: boolean = false;
  public itemList: any = [];
  public itemFilterList: any = [];
  public hasLoggin: any = {};
  public showNoRecord: boolean = false;
  public page: number = 0;
  public pageSize: number = 10;
  public totalCount: number = 0;
  public searchKeyword: string = '';
  public searchField: any = 5;
  public searchFieldControl: any = 5;
  public orderBy: string = 'desc';
  public fallbackImg: string = 'assets/img/item-placeholder.jpg';
  public isSearchVisible: boolean = false;
  private handleOutsideClick: any;
  constructor(
    public router: Router,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private menu: MenuController,
    private commonService: CommonService,
    private popoverController: PopoverController,
    private authenticationService: AuthService,
    private pageTitleService: PageTitleService,
    private authGuardService: AuthGuardService,
    private loaderService: LoaderService
    // private sharedService: SharedService,
  ) {


    activatedRoute.params.subscribe(val => {
      this.pageTitleService.setPageTitle('Bid Request');
      this.handleSearchToggle();
      this.getItemList();
    });
  }

  async ngOnInit() {
    // Check authentication on component initialization
    await this.authGuardService.checkTokenAndAuthenticate();
    

    
  }

    // Convert UOM ID to display text
    getUOMText(uomId: number): string {
      switch (uomId) {
        case 2:
          return 'KGS';
        case 23:
          return 'QTL';
        case 27:
          return 'TON';
        default:
          return '';
      }
    }

  handleSearchToggle() {
    // Use ViewChild or template reference variables instead of querySelector
    this.isSearchVisible = false;
  }

  toggleSearch() {
    this.isSearchVisible = !this.isSearchVisible;
  }

  closeSearch() {
    this.isSearchVisible = false;
    if (this.searchKeyword.length > 0) {
      this.searchField = '';
      this.searchKeyword = '';
      this.page = 0;
      this.itemList = [];
      this.getItemList();
    }
  }

  onOutsideClick(event: Event) {
    // This will be called from template using (click) event
    if (this.isSearchVisible) {
      this.isSearchVisible = false;
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement | null;
    if (target && target.src !== this.fallbackImg) {
      target.src = this.fallbackImg;
    }
  }

  getItemList() {
    let data = {
      module: 2,
      start: this.page,
      limit: 10,
      orderfield: this.searchField == 5 ? 'item_master.added_on' : this.searchField,
      orderby: this.orderBy,
      //keyword: this.searchKeyword ? this.searchKeyword : '',
      serach_keyward: this.searchKeyword ? this.searchKeyword : '',
      options: this.searchField == 5 ? 'item_master.added_on' : this.searchField

    }
    if (this.page == 0) {
      this.loaderService.show();
    }
    let url = `bids/list`;
    this.commonService.post(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          if (this.page === 0) {
            // Replace list on a fresh load so updated items are reflected
            this.itemList = response.results || [];
          } else {
            // Concatenate for pagination and de-duplicate
            this.itemList = _.uniqBy(
              this.itemList.concat(response.results || []),
              'id'
            );
          }
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
        this.loaderService.hide();

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
    this.searchFieldControl = event;

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

  

  async confirmBidAction(item: any, action: 'accept' | 'reject') {
    const isAcceptAction = action === 'accept';
    const alert = await this.alertController.create({
      header: isAcceptAction ? 'Accept Bid' : 'Reject Bid',
      message: isAcceptAction
        ? 'Are you sure you want to accept bid?'
        : 'Are you sure you want to reject bid?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel',
          handler: (blah:any) => {}
        }, {
          text: 'Ok',
          cssClass: 'alert-ok',
          handler: async () => {
            if (!isAcceptAction) {
              // Open reason modal for rejection
              const modal = await this.modalController.create({
                component: RejectReasonModalComponent,
                cssClass: 'bid-modal'
              });
              await modal.present();
              const { data } = await modal.onWillDismiss();
              if (!data || !data.reason) {
                return; // user cancelled or empty
              }
              this.submitBidStatus(item, 2, data.reason);
            } else {
              this.submitBidStatus(item, 1);
            }
          }
        }
      ]
    });
    await alert.present();  
  }

  private submitBidStatus(item: any, bidStatus: number, cancelRejectionReason?: string) {
    const url = 'bids/add';
    const data = {
      item_id: item.id,
      bid_amount: item.bid_amount,
      actual_bid_amount: item.actual_bid_amount,
      bid_quantity: parseInt(item.bid_quantity, 10),
      bid_status: bidStatus,
      cancel_rejection_reason: cancelRejectionReason ?? null
    };
    this.loaderService.show();
    this.commonService.post(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          // Reset pagination and reload fresh list so UI reflects changes
          this.page = 0;
          this.itemList = [];
          this.getItemList();          
          this.showToast('success', response.message, '', 2500, '');
          
        } else {
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
      }
    );
  }

  acceptBid(item: any) {
    this.submitBidStatus(item, 1);
  }

  rejectBid(item: any) {
    this.submitBidStatus(item, 2);
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


