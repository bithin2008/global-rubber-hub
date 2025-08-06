import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PageTitleService } from '../services/page-title.service';
import { Subscription } from 'rxjs';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [ IonicModule, FormsModule, ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent ]
})
export class DashboardPage implements OnInit {
  public enableLoader: boolean = false;
  private subscription: Subscription = new Subscription();
  public profileName: string = '';
  constructor(
    private router: Router,
    private profileService: ProfileService,
    private pageTitleService: PageTitleService
  ) { }

  ngOnInit() {
    // Set the page title when the page loads
    this.pageTitleService.setPageTitle('Dashboard');
    this.subscription.add(
      this.profileService.userName$.subscribe((data) => {
        this.profileName = data.split(' ')[0];
      })
    );
  }





}
