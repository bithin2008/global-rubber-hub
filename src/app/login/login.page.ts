import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { AlertController, MenuController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule, ReactiveFormsModule, IonInput, IonButton, IonContent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPage implements OnInit {
  @ViewChild('loginInput') loginInput: any;
  public enableLoader: boolean = false;
  public loginForm!: FormGroup;
  public submitted: boolean = false;
  public loginType = 'company';
  public savedLoginCredential: any = [];
  public showCredentialsElem: any = '';
  public savedLoginCounter: number = 0;
  public isOpenCredentialModal: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private menu: MenuController,
    private commonService: CommonService,
    private authenticationService: AuthService,
    private alertController: AlertController
  ) {

    this.activatedRoute.params.subscribe(async val => {
      let hasLoggin: any = await this.alreadyLoggedIn();
      if (hasLoggin.status === 200) {
        this.router.navigate(['/dashboard'])
      }
    });
  }

  //amaleshdebnath68394@gmail.com
  //Amalesh@goo2022

  //nantu16051984@gmail.com
  //Nantu@goo2022

  //sujansouth1@gmail.com
  //Sujan@goo2022

  //nipursouth@gmail.com
  //Nipur@goo2022

  //sahingomati@gmail.com
  //Sahin@goo2022

  //tajul27120@gmail.com
  //Tajul@goo2022

  //krishnakantawest@gmail.com
  //Krishna@2017


  //sangitarubber12@gmail.com
  //Tutan@2017
  async ngOnInit() {
    this.menu.enable(false);
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)]]
    });

    // let hasUserCredentialTable = await this.isTableExists('user_credentials');
    // if (!hasUserCredentialTable) {
    //   this.sqlite.create({
    //     name: 'gstsof_data.db',
    //     location: 'default'
    //   })
    //     .then((db: SQLiteObject) => {
    //       db.executeSql('CREATE TABLE IF NOT EXISTS user_credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)', [])
    //         .then(() => console.log('Table created successfully'))
    //         .catch(error => console.error('Error creating table: ', error));
    //     })
    //     .catch(error => {
    //       console.error('Error opening database: ', error);
    //     });
    // }
  }

  alreadyLoggedIn() {
    return new Promise((resolve) => {
      this.authenticationService.checkUserIsLoggedin().subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          console.log('error', error);
        }
      );
    });
  }

  get f() { return this.loginForm.controls; }

  changeLoginType() {
    this.loginForm.reset();
    this.submitted = false;
  }

  checkSavedLogin() {
    if (this.savedLoginCounter == 0) {
      this.savedLoginCounter++;
     // this.showLoginCredential();
    } else {
      setTimeout(() => {
        this.savedLoginCounter = 0;
      }, 45 * 1000);
    }
  }

  // showLoginCredential() {

  //   this.savedLoginCredential = [];

  //   this.sqlite.create({
  //     name: 'gstsof_data.db',
  //     location: 'default'
  //   })
  //     .then((db: SQLiteObject) => {
  //       db.executeSql('SELECT * FROM user_credentials', [])
  //         .then((res) => {
  //           if (res.rows.length > 0) {
  //             this.isOpenCredentialModal = true;
  //             for (var i = 0; i < res.rows.length; i++) {
  //               res.rows.item(i).cryptpassword = res.rows.item(i).password.replace(/./g, '*');
  //               this.savedLoginCredential.push(res.rows.item(i));
  //             }
  //             this.showCredentialsElem = document.querySelector('.login-credential-modal');
  //             this.showCredentialsElem.classList.add('openMenu');
  //           } else {
  //             this.isOpenCredentialModal = false;
  //             this.closeItemModal();
  //           }
  //         })
  //         .catch(error => console.error('Error executing query: ', error));
  //     })
  //     .catch(error => {
  //       console.error('Error opening database: ', error);
  //     });
  // }

  setCredential(item:any) {
    this.loginForm.controls['email'].setValue(item.email);
    this.loginForm.controls['password'].setValue(item.password);
    this.closeItemModal();
    this.login();
  }

  closeItemModal() {
    let itmModal:any = document.querySelector('.login-credential-modal');
    itmModal.classList.remove('openMenu');
    itmModal.classList.add('closeMenu');
    this.isOpenCredentialModal = false;
    itmModal.addEventListener('animationend', (e: any) => {
      if (e.target == itmModal) {
        itmModal.classList.remove('closeMenu');
      };
    });
  }

  login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    let data = {
      email: this.f['email'].value,
      password: this.f['password'].value,
    };
    this.enableLoader = true;
    let url = 'login';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          localStorage.setItem('token', response.access_token);

          this.showToast('success', response.message, '', 4000, '/dashboard');
         

        } else if (response.code == 401) {
          this.showToast('error', response.message, '', 2000, '');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2000, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );
  }

  goToLogin(){
    this.router.navigate(['/login']);
  }

  goToRegister(){
    this.router.navigate(['/register']);
  }

  async deleteCredential(item:any) {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Want to delete password?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'alert-cancel',
          handler: (blah) => {

          }
        }, {
          text: 'Yes',
          cssClass: 'alert-ok',
          handler: () => {
            // this.sqlite.create({
            //   name: 'gstsof_data.db',
            //   location: 'default'
            // }).then((db: SQLiteObject) => {
            //   db.executeSql(`DELETE FROM user_credentials WHERE email = ?`, [item.email])
            //     .then((res) => {
            //      // this.showLoginCredential();
            //     })
            //     .catch(error => console.error('Error executing query: ', error));
            // })
          }
        }
      ]
    });
    await alert.present();
  }

  // async isTableExists(tableName: string): Promise<boolean> {
  //   try {
  //     const db: SQLiteObject = await this.sqlite.create({
  //       name: 'gstsof_data.db',
  //       location: 'default'
  //     });

  //     const result = await db.executeSql(
  //       `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
  //       [tableName]
  //     );

  //     return result.rows.length > 0;
  //   } catch (error) {
  //     console.error('Error checking table existence:', error);
  //     return false;
  //   }
  // }


  async saveLoginCredential(name:any) {
    const alert = await this.alertController.create({
      header: 'Hi,' + name,
      message: 'Want to save  password?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'alert-cancel',
          handler: (blah) => {

          }
        }, {
          text: 'Yes',
          cssClass: 'alert-ok',
          handler: () => {
            // this.sqlite.create({
            //   name: 'gstsof_data.db',
            //   location: 'default'
            // })
            //   .then((db: SQLiteObject) => {
            //     db.executeSql('CREATE TABLE IF NOT EXISTS user_credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)', [])
            //       .then(() => console.log('Table created successfully'))
            //       .catch(error => console.error('Error creating table: ', error));

            //     db.executeSql('INSERT INTO user_credentials (email,password) VALUES (?,?)', [this.f['email'].value, this.f['password'].value])
            //       .then(() => console.log('Data inserted successfully'))
            //       .catch(error => console.error('Error inserting data: ', error));
            //   })
            //   .catch(error => {
            //     console.error('Error opening database: ', error);
            //   });
          }
        }
      ]
    });
    await alert.present();
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
