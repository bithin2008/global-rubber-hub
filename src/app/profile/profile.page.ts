import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController, ActionSheetController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule]
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;
  public type: any;
  public enableLoader: boolean = false;
  public submitted: boolean = false;
  public profileImage: string = 'assets/img/profile-placeholder.jpg';
  public countries: any[] = [];
  public filteredCountries: any[] = [];
  public showCountryDropdown: boolean = false;
  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public modalController: ModalController,
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.getProfileData()
    this.loadCountries()
    this.profileForm = this.formBuilder.group({
      full_name: ['', [Validators.required, Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      company: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      pan: ['', [Validators.pattern(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/i)]],
      id_proof_type: [''],
      idFile: [null],
      country: ['', [Validators.required]],
      company_address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      zip: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // Listen for country changes to update PAN validation
    this.profileForm.get('country')?.valueChanges.subscribe(country => {
      const panControl = this.profileForm.get('pan');
      if (country === 'India') {
        panControl?.setValidators([Validators.required, Validators.pattern(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/i)]);
      } else {
        panControl?.clearValidators();
        panControl?.setValue(''); // Clear the value when not India
      }
      panControl?.updateValueAndValidity();
    });
  }

  get f() { return this.profileForm.controls; }

  loadCountries() {
    fetch('assets/JSON/country.json')
      .then(response => response.json())
      .then(data => {
        console.log('Loaded countries data:', data);
        this.countries = data;
        this.filteredCountries = data; // Initialize filtered countries with all countries
        console.log('Countries array:', this.countries);
        console.log('Filtered countries array:', this.filteredCountries);
      })
      .catch(error => {
        console.error('Error loading countries:', error);
      });
  }

  filterCountries(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    console.log('Search term:', searchTerm);
    console.log('All countries:', this.countries);
    
    if (searchTerm) {
      this.filteredCountries = this.countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredCountries = this.countries;
    }
    console.log('Filtered countries:', this.filteredCountries);
    this.showCountryDropdown = true;
  }

  selectCountry(countryName: string) {
    this.profileForm.patchValue({ country: countryName });
    this.showCountryDropdown = false;
    this.filteredCountries = this.countries; // Reset filtered countries
  }

  onCountryBlur() {
    console.log('Country field blurred');
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      this.showCountryDropdown = false;
      console.log('Dropdown hidden after blur');
    }, 200);
  }

  onCountryFocus() {
    console.log('Country field focused');
    this.showCountryDropdown = true;
    console.log('Dropdown shown on focus');
  }


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

  tabChange(e: any) {
    console.log('e');

  }

  onInputChange(event: any) {
    let inputValue: any = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, '');
    inputValue = inputValue.slice(0, 6);
    this.profileForm.patchValue({
      zip: inputValue
    });
  }

  goToDashboard(event: Event) {
    event.preventDefault(); // prevent default tab switch
    this.router.navigateByUrl('/dashboard');
  }

  async openCamera() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Photo Library',
          icon: 'images',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: source
      });

      if (image.webPath) {
        // Store the image URI directly in the variable
        this.profileImage = image.webPath;

        // Convert to PNG format using canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const file = new File([pngBlob], 'profile-photo.png', { type: 'image/png' });

              // Upload the image to server using FormData
              let url = 'user/update-profile-image';
              const formData = new FormData();
              formData.append('profile_image', file);

              this.commonService.filepost(url, formData).subscribe(
                (res: any) => {
                  this.enableLoader = false;
                  console.log('Response type:', typeof res);
                  console.log('Response:', res);

                  // Handle different response types
                  let responseData;
                  if (res instanceof Blob) {
                    // If response is a blob, try to parse it as JSON
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        responseData = JSON.parse(reader.result as string);
                        if (responseData.code == 200) {
                          this.showToast('success', responseData.message, '', 2500, '');
                        } else {
                          this.showToast('error', responseData.message, '', 2500, '');
                        }
                      } catch (e) {
                        console.error('Error parsing blob response:', e);
                        this.showToast('error', 'Invalid response format', '', 2500, '');
                      }
                    };
                    reader.readAsText(res);
                  } else {
                    // Handle regular JSON response
                    responseData = res;
                    if (responseData.code == 200) {
                      this.showToast('success', responseData.message, '', 2500, '');
                    } else {
                      this.showToast('error', responseData.message, '', 2500, '');
                    }
                  }
                },
                (error) => {
                  this.enableLoader = false;
                  console.log('error ts: ', error.error);
                  this.showToast('error', 'Upload failed', '', 2500, '');
                }
              );
            }
          }, 'image/png');
        };
        img.src = image.webPath;
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      this.showToast('error', 'Failed to capture image', '', 3000, '');
    }
  }

  updateProfile() {
    this.submitted = true;
    if (this.profileForm.invalid) {
      return;
    }
    let data = {
      full_name: this.f['full_name'].value,
      email: this.f['email'].value,
      phone: this.f['phone'].value,
      company: this.f['company'].value,
      pan: this.f['country'].value === 'India' ? this.f['pan'].value : '',
      id_proof_type: this.f['id_proof_type'].value,
      country: this.f['country'].value,
      addcompany_addressress: this.f['company_address'].value,
      zip: this.f['zip'].value
    };
    this.enableLoader = true;
    let url = 'user/profile-update';
    this.commonService.post(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 201) {
          this.showToast('success', response.message, '', 2500, '');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2500, '');
        } else {
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );
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
