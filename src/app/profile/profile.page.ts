import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [ IonicModule, FormsModule, ReactiveFormsModule, CommonModule, IonInput ]
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;

  constructor( public router: Router, private formBuilder: FormBuilder ) { }

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: [''],
      pan: [''],
      idType: [''],
      idFile: [null],
      country: [''],
      address: [''],
      zip: ['']
    });
  }

  tabChange(e:any){
    console.log('e');
    
  }

  goToDashboard(event: Event) {
    event.preventDefault(); // prevent default tab switch
    this.router.navigateByUrl('/dashboard');
  }

}
