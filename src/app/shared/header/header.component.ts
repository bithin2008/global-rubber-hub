import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { PageTitleService } from '../../services/page-title.service';
import { WalletService } from '../../services/wallet.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  profileImage: string = '';
  showPlaceholder: boolean = true;
  pageTitle: string = 'Global Rubber Hub';
  walletBalance: number = 0;
  unreadNotifications: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private pageTitleService: PageTitleService,
    private walletService: WalletService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    // Subscribe to profile image changes
    this.subscription.add(
      this.profileService.profileImage$.subscribe((imageUrl) => {
        this.profileImage = imageUrl;
        this.showPlaceholder = !imageUrl;
      })
    );

    // Subscribe to page title changes
    this.subscription.add(
      this.pageTitleService.pageTitle$.subscribe((title) => {
        this.pageTitle = title;
      })
    );

    // Subscribe to wallet balance changes
    this.subscription.add(
      this.walletService.walletBalance$.subscribe((balance) => {
        this.walletBalance = balance;
      })
    );

    // Subscribe to notification updates
    this.subscription.add(
      this.notificationService.notifications$.subscribe((notificationState) => {
        this.unreadNotifications = notificationState.unreadCount;
      })
    );
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  goToProfile() {
    this.router.navigate(['/account']);
  }

  onImageError() {
    this.showPlaceholder = true;
  }

}