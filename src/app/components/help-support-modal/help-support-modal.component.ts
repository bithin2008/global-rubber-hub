import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonTextarea, IonIcon, ModalController, IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-help-support-modal',
  templateUrl: './help-support-modal.component.html',
  styleUrls: ['./help-support-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonTextarea, IonIcon, IonCard, IonCardContent]
})
export class HelpSupportModalComponent implements OnInit {
  public contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  public supportOptions = [
   
    {
      title: 'Phone Support',
      description: '', // Hidden from display
      icon: 'call',
      action: 'phone'
    },
    {
      title: 'WhatsApp',
      description: '', // Hidden from display
      icon: 'logo-whatsapp',
      action: 'whatsapp'
    },
    {
        title: 'Email Support',
        description: '', // Hidden from display
        icon: 'mail',
        action: 'email'
      }
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss();
  }

  async handleSupportAction(action: string, data?: any) {
    switch (action) {
      case 'email':
        // Open email client with the support email
        window.open('mailto:connect@globalrubberhub.com?subject=Support Request', '_blank');
        break;
      case 'phone':
        // Open phone dialer with the support number
        window.open('tel:+917710100606', '_blank');
        break;
      case 'whatsapp':
        // Open WhatsApp with the support number
        const whatsappUrl = 'https://wa.me/917710100606?text=Hi, I need support for Global Rubber Hub';
        window.open(whatsappUrl, '_blank');
        break;
      case 'faq':
        // Navigate to FAQ page or show FAQ modal
        console.log('Opening FAQ...');
        break;
    }
  }

  async submitContactForm() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      return;
    }

    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', this.contactForm);
    
    // For now, just show success message
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset form
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}
