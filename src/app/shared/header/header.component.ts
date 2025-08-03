import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
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
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    // Subscribe to profile image changes
    this.subscription.add(
      this.profileService.profileImage$.subscribe((imageUrl) => {
        this.profileImage = imageUrl;
        this.showPlaceholder = !imageUrl;
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
    this.router.navigate(['/profile']);
  }

  onImageError() {
    this.showPlaceholder = true;
  }

}