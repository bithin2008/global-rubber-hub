import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-verify-now',
  templateUrl: './verify-now.page.html',
  styleUrls: ['./verify-now.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel]
})
export class VerifyNowPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
