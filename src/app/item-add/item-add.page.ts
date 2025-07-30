import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonButton, IonButtons,IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.page.html',
  styleUrls: ['./item-add.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonRadioGroup, IonRadio]
})
export class ItemAddPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
