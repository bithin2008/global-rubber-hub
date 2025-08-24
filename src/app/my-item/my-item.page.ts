import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthGuardService } from '../services/auth-guard.service';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonList, IonButton,IonLabel, IonIcon, IonAvatar, IonCardContent, IonImg, IonButtons, IonItem, IonSelect, IonSelectOption, IonInput, IonInfiniteScroll, IonInfiniteScrollContent, ModalController } from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, MenuController, PopoverController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common-service';
import * as _ from 'lodash';
import { register } from 'swiper/element/bundle';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PageTitleService } from '../services/page-title.service';


@Component({
  selector: 'app-my-item',
  templateUrl: './my-item.page.html',
  styleUrls: ['./my-item.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonIcon, IonLabel, IonAvatar, CommonModule, FormsModule, IonCard, IonButton, IonCardContent, IonButtons, IonItem, IonSelect, IonSelectOption, IonInput, IonInfiniteScroll, IonInfiniteScrollContent, HeaderComponent, FooterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyItemPage implements OnInit{
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
  public searchFieldControl: any = 5;
  public orderBy: string = 'desc';
  public fallbackImg: string = 'assets/img/item-placeholder.jpg';
  private handleOutsideClick: any;
  constructor(
    public router: Router,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private menu: MenuController,
    private commonService: CommonService,
    private popoverController: PopoverController,
    private authenticationService: AuthService,
    private pageTitleService: PageTitleService,
    private authGuardService: AuthGuardService
    // private sharedService: SharedService,
  ) { 
    // Subscribe to both route params and query params
    activatedRoute.params.subscribe(val => {
      this.pageTitleService.setPageTitle('My Items');
      this.getItemList();
    });


  }
  async ngOnDestroy() {
    // Cleanup listeners to avoid memory leaks
    document.removeEventListener('click', this.handleOutsideClick, true);
  }
  async ngOnInit() {
    // Check authentication on component initialization
    await this.authGuardService.checkTokenAndAuthenticate();
    this.handleSearchToggle();
  }
 
 handleSearchToggle() {
    const btnSearch = document.querySelector('.btnsearch');
    const bottom = document.querySelector('.bottom');
    const btnClose = document.querySelector('.bottom .close');

    if (btnSearch && bottom && btnClose) {
      btnSearch.addEventListener('click', (event) => {
        event.stopPropagation(); // prevent triggering outside click
        bottom.classList.add('show');
      });

      btnClose.addEventListener('click', (event) => {
        event.stopPropagation();
        bottom.classList.remove('show');
        if(this.searchKeyword.length>0){ 
          this.searchField = '';
          this.searchKeyword = '';
          this.page = 0;
          this.itemList = [];
          this.getItemList();
         } 
      });

      // Handle outside click
      this.handleOutsideClick = (event: Event) => {
        if (bottom.classList.contains('show')) {
          const target = event.target as HTMLElement;
          const isClickInside = bottom.contains(target) || btnSearch.contains(target);
          if (!isClickInside) {
            bottom.classList.remove('show');
          }
        }
      };

      document.addEventListener('click', this.handleOutsideClick, true);
    }
  }

  

  async handleRefresh(e:any) {
    this.searchField = '';
    this.searchKeyword = '';
    this.itemList = [];
    this.page = 0;
    this.getItemList();
    e.target.complete();
  }

  goToAddItem(){
    this.router.navigate(['/item-add']);
  }

  filterByType(type: string) {
    console.log('Filtering by type:', type);
    
    // Reset the list and page when filtering
    this.page = 0;
    this.itemList = [];
    
    // Add the type filter to your API call
    // You can modify the getItemList method to include this filter
    // or create a separate method for filtered items
    
    // For now, let's just log the filter and call getItemList
    // You can enhance this based on your API requirements
    this.getItemList();
  }

  editItem(itemId: number) {
    this.router.navigate(['/item-add'], { queryParams: { id: itemId } });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement | null;
    if (target && target.src !== this.fallbackImg) {
      target.src = this.fallbackImg;
    }
  }

  getItemList() {
    let data = {
      module: 1,
      start: this.page,
      limit: 10,
      orderfield: this.searchField==5 ? 'item_master.added_on':this.searchField,
      orderby: this.orderBy,
      keyword: this.searchKeyword ? this.searchKeyword : '',
      options:  this.searchField==5 ? 'item_master.added_on':this.searchField
    }

    // Add type filter if available from route params
    // You can get the current route params here if needed
    // For now, we'll handle it in the filterByType method
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

}

