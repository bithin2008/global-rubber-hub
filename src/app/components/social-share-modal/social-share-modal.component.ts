import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonItem, IonLabel, IonInput, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  close, 
  copy, 
  logoWhatsapp, 
  logoFacebook, 
  logoTwitter, 
  logoInstagram, 
  logoLinkedin, 
  mail, 
  share,
  send
} from 'ionicons/icons';

@Component({
  selector: 'app-social-share-modal',
  templateUrl: './social-share-modal.component.html',
  styleUrls: ['./social-share-modal.component.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButtons,
    CommonModule, 
    FormsModule
  ]
})
export class SocialShareModalComponent implements OnInit {
  @Input() referralLink: string = '';
  @Input() referralCode: string = '';
  @Input() shareText: string = '';

  constructor(private modalController: ModalController) {
    addIcons({ 
      close, 
      copy, 
      logoWhatsapp, 
      logoFacebook, 
      logoTwitter, 
      logoInstagram, 
      logoLinkedin, 
      mail, 
      share,
      send
    });
  }

  ngOnInit() {
    // Generate share text if not provided
    if (!this.shareText && this.referralCode) {
      this.shareText = `Join me on Global Rubber Hub! Use my referral code: ${this.referralCode}\n\nDownload the app: ${this.referralLink}`;
    }
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async shareToPlatform(platform: string) {
    const encodedText = encodeURIComponent(this.shareText);
    const encodedUrl = encodeURIComponent(this.referralLink);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join Global Rubber Hub&body=${encodedText}`;
        break;
      default:
        return;
    }

    // Open the sharing URL
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  async copyToClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(this.referralLink);
        this.showToast('success', 'Link copied to clipboard!', 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = this.referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast('success', 'Link copied to clipboard!', 2000);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showToast('error', 'Failed to copy to clipboard', 2000);
    }
  }

  private showToast(type: string, message: string, duration: number) {
    // You can implement toast notification here
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}
