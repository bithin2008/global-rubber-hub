import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [ IonicModule, FormsModule, ReactiveFormsModule, CommonModule ]
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;
  public type: any;
  public enableLoader: boolean = false;
  public submitted: boolean = false;
  constructor( public router: Router, private formBuilder: FormBuilder, private commonService: CommonService, public modalController: ModalController, ) { }

  ngOnInit() {
    this.getProfileData()
    this.profileForm = this.formBuilder.group({
      full_name: ['', Validators.required,Validators.maxLength(60)],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: ['',[Validators.required,Validators.minLength(3),Validators.maxLength(40)]],
      pan: ['',[Validators.required,Validators.maxLength(12)]],
      id_proof_type: [''],
      idFile: [null],
      country: ['',[Validators.required,Validators.minLength(5),Validators.maxLength(20)]],
      address: ['',[Validators.required,Validators.minLength(5),Validators.maxLength(50)]],
      zip: ['',[Validators.required,Validators.minLength(5),Validators.maxLength(5)]]
    });
  }

  get f() { return this.profileForm.controls; }
 

  getProfileData() {
    this.enableLoader = true;
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.profileForm.patchValue(response.user)
        } else {
          this.showToast('error', response.message, '', 3500, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );

  }

  tabChange(e:any){
    console.log('e');
    
  }

  onInputChange(event: any) {
    let inputValue: any = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, '');
    inputValue = inputValue.slice(0, 6);
  }

  goToDashboard(event: Event) {
    event.preventDefault(); // prevent default tab switch
    this.router.navigateByUrl('/dashboard');
  }

  updateProfile() {
    this.submitted = true;
    if (this.profileForm.invalid) {
      return;
    }
  }

  async showToast(
    status: string,
    message: string,
    submessage: string,
    timer: number,
    redirect: string
  ) {
    const modal = await this.modalController.create({
      component: ToastModalComponent,
      cssClass: 'toast-modal',
      componentProps: {
        status: status,
        message: message,
        submessage: submessage,
        timer: timer,
        redirect: redirect
      }
    });
    return await modal.present();
  }

}
