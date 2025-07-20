import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [ IonicModule, FormsModule,  CommonModule]
})
export class ProfilePage implements OnInit {

  constructor( public router: Router,) { }

  ngOnInit() {
  }

  tabChange(e:any){
    console.log('e');
    
  }

  goToDashboard(event: Event) {
    event.preventDefault(); // prevent default tab switch
    this.router.navigateByUrl('/dashboard');
  }

}
