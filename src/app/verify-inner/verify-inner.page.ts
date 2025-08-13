import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-verify-inner',
  templateUrl: './verify-inner.page.html',
  styleUrls: ['./verify-inner.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VerifyInnerPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
