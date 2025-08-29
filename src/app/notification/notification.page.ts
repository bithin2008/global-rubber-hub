import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonItem, IonIcon, IonLabel, IonButton, IonButtons, ModalController } from '@ionic/angular/standalone';

import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import _ from 'lodash';
import { register } from 'swiper/element';
import { AuthGuardService } from '../services/auth-guard.service';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common-service';
import { PageTitleService } from '../services/page-title.service';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';
import { NotificationDetailModalComponent } from './notification-detail-modal/notification-detail-modal.component';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCard,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonButtons,
    TimeAgoPipe
  ]
})
export class NotificationPage implements OnInit {
  public page: number = 0;
  public pageSize: number = 10;
  public orderBy: string = 'desc';
  public enableLoader: boolean = false;
  public showNoRecord: boolean = false;
  public totalCount: number = 0;
  public notificationList: any = [];
  constructor(
    public router: Router,
    private commonService: CommonService,
    public activatedRoute: ActivatedRoute,
    private authenticationService: AuthService,
    private pageTitleService: PageTitleService,
    private authGuardService: AuthGuardService,
    private location: Location,
    private modalCtrl: ModalController) {
    activatedRoute.params.subscribe(val => {
      this.pageTitleService.setPageTitle('Notifications');
      this.getNotificationList();
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.location.back();
  }

  async openNotificationDetail(notification: any) {
    this.enableLoader = true;

    try {
      // Call API to mark as read and get full details
      const url = `notifications/read`;
      let data = { notification_id: notification.id, read_all: 0 };
      const response: any = await this.commonService.post(url, data).toPromise();

      if (response.code === 200) {
        // Create and present modal with full notification details
        const modal = await this.modalCtrl.create({
          component: NotificationDetailModalComponent,
          componentProps: {
            notification: response.notification || notification
          },
          cssClass: 'notification-detail-modal',
          breakpoints: [0, 0.5, 0.8],
          initialBreakpoint: 0.5
        });

        // After modal is closed, refresh the notification list
        modal.onDidDismiss().then(() => {
          this.page = 0;
          this.notificationList = [];
          this.getNotificationList();
        });

        await modal.present();
      } else {
        this.showToast('error', response.message || 'Failed to load notification details', '', 3000, '');
      }
    } catch (error) {
      console.error('Error loading notification details:', error);
      this.showToast('error', 'Failed to load notification details', '', 3000, '');
    } finally {
      this.enableLoader = false;
    }
  }

  getNotificationList(user_id?: number) {
    let data: any = {
      start: this.page,
      limit: 10,
      orderby: this.orderBy
    }

    if (this.page == 0) {
      this.enableLoader = true;
    }
    let url = `notifications/list`;
    this.commonService.post(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.notificationList = this.notificationList.concat(response.results);
          this.notificationList = _.uniqBy(this.notificationList, 'id');
          this.totalCount = response.total_count;
          if (this.notificationList.length > 0) {
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

  async showToast(
    status: string,
    message: string,
    submessage: string,
    timer: number,
    redirect: string
  ) {
    const modal = await this.modalCtrl.create({
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
