import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonItem, IonLabel, IonInput } from '@ionic/angular/standalone';
import { Icon } from 'ionicons/dist/types/components/icon/icon';

@Component({
  selector: 'app-verify-inner',
  templateUrl: './verify-inner.page.html',
  styleUrls: ['./verify-inner.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonFooter, IonItem, IonLabel, IonInput]
})
export class VerifyInnerPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
