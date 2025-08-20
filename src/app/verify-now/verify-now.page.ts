import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-now',
  templateUrl: './verify-now.page.html',
  styleUrls: ['./verify-now.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel]
})
export class VerifyNowPage implements OnInit {

  constructor(private location: Location, private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.location.back();
  }

  goToPan() {
    this.router.navigate(['/verify-inner']);
  }

  goToGSTUdyam(){
    this.router.navigate(['/gst-udyam-verification']);
  }



}
