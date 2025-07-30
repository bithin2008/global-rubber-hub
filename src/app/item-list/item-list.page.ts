import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonCard,IonList,IonButton,IonIcon,IonCardContent,IonImg,IonButtons,IonItem,IonSelect,IonSelectOption,IonInput, IonInfiniteScroll, IonInfiniteScrollContent, ModalController} from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, MenuController, PopoverController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common-service';
import { BidModalComponent } from './bid-modal.component';
import * as _ from 'lodash';
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.page.html',
  styleUrls: ['./item-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonList, IonButton, IonIcon, IonCardContent, IonImg, IonButtons, IonItem, IonSelect, IonSelectOption, IonInput, IonInfiniteScroll, IonInfiniteScrollContent],
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
  public searchField: string = '';
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

  getItemList() {
    let data = {
      module:1,
      start: this.page,
      limit: 10,
      order_field: this.searchField ? this.searchField : 'item_master.price',
      order_by: 'asc',
      keyword: this.searchKeyword ? this.searchKeyword : '',
      options: this.searchField ? this.searchField : ''

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

  loadData(event:any) {
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

  searchItem(event:any) {
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

  selectFilter() {
    if (this.searchField) {
      this.filterWarning = false;
    }
    this.page = 0;
        this.itemList = [];
        this.getItemList();
  }

  async openBidModal(item: any) {
    const modal = await this.modalController.create({
      component: BidModalComponent,
      componentProps: {
        item: item
      },
      cssClass: 'bid-modal',
      presentingElement: await this.modalController.getTop(),
      backdropDismiss: true,
      showBackdrop: true
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // Handle the bid submission
      console.log('Bid submitted:', data);
      // You can add your bid submission logic here
      // For example, call an API to submit the bid
    }
  }

}
