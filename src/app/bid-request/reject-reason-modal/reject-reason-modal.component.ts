import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonTextarea, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-reject-reason-modal',
  templateUrl: './reject-reason-modal.component.html',
  styleUrls: ['./reject-reason-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonTextarea,
    IonButton
  ]
})
export class RejectReasonModalComponent {
  public form: FormGroup;

  constructor(
    private modalController: ModalController,
    formBuilder: FormBuilder
  ) {
    this.form = formBuilder.group({
      reason: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]]
    });
  }

  get f() { return this.form.controls; }

  dismiss() {
    this.modalController.dismiss(null);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.modalController.dismiss({ reason: this.form.value.reason });
  }
}


