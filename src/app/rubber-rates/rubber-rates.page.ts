import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-rubber-rates',
  templateUrl: './rubber-rates.page.html',
  styleUrls: ['./rubber-rates.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RubberRatesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
