import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toast: any;
  constructor(
    public toastController: ToastController
  ) { }


  showToast(toastMessage:any) {
    this.toast = this.toastController.create({
      message: toastMessage,
      cssClass:"custom-toast",
      animated:true,
      duration: 3000
    }).then((toastData)=>{
      console.log(toastData);
      toastData.present();
    });
  }


  hideToast(){
    this.toast = this.toastController.dismiss();
  }
}
