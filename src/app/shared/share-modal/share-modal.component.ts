import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonButton, 
  IonButtons, 
  IonContent, 
  IonHeader, 
  IonIcon, 
  IonItem, 
  IonLabel,
  IonList, 
  IonTitle, 
  IonToolbar,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar
  ]
})
export class ShareModalComponent implements OnInit {
  @Input() shareData: any = {};

  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    console.log('ShareModal initialized with data:', this.shareData);
    
    // Set default share data if not provided
    if (!this.shareData || !this.shareData.title) {
      this.shareData = {
        title: 'Check out this item',
        text: 'Found something interesting to share',
        url: window.location.href
      };
      console.log('Using default share data:', this.shareData);
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  // Share on WhatsApp
  shareOnWhatsApp() {
    const text = encodeURIComponent(`${this.shareData.title}\n\n${this.shareData.text}\n\n${this.shareData.url}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    this.openShareUrl(whatsappUrl, 'WhatsApp');
  }

  // Share on Facebook Messenger
  shareOnMessenger() {
    const url = encodeURIComponent(this.shareData.url);
    const messengerUrl = `https://www.messenger.com/new?message=${encodeURIComponent(this.shareData.title + '\n' + this.shareData.url)}`;
    this.openShareUrl(messengerUrl, 'Messenger');
  }

  // Share on Facebook
  shareOnFacebook() {
    const url = encodeURIComponent(this.shareData.url);
    const title = encodeURIComponent(this.shareData.title);
    const description = encodeURIComponent(this.shareData.text);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
    this.openShareUrl(facebookUrl, 'Facebook');
  }

  // Share on LinkedIn
  shareOnLinkedIn() {
    const url = encodeURIComponent(this.shareData.url);
    const title = encodeURIComponent(this.shareData.title);
    const summary = encodeURIComponent(this.shareData.text);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    this.openShareUrl(linkedinUrl, 'LinkedIn');
  }

  // Share on Twitter
  shareOnTwitter() {
    const text = encodeURIComponent(`${this.shareData.title} ${this.shareData.url}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    this.openShareUrl(twitterUrl, 'Twitter');
  }

  // Share via Email
  shareViaEmail() {
    const subject = encodeURIComponent(this.shareData.title);
    const body = encodeURIComponent(`${this.shareData.text}\n\n${this.shareData.url}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    this.openShareUrl(emailUrl, 'Email');
  }

  // Copy link to clipboard
  async copyToClipboard() {
    try {
      const shareText = `${this.shareData.title}\n\n${this.shareData.text}\n\n${this.shareData.url}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        this.showToast('Link copied to clipboard!');
      } else {
        this.fallbackCopy(shareText);
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      this.fallbackCopy(`${this.shareData.title}\n\n${this.shareData.text}\n\n${this.shareData.url}`);
    }
  }

  // Fallback copy method for older browsers
  private fallbackCopy(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    try {
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      this.showToast('Link copied to clipboard!');
    } catch (error) {
      console.error('Manual copy failed:', error);
      this.showToast('Failed to copy link. Please copy manually.');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  // Open share URL in new tab/window
  private openShareUrl(url: string, platform: string) {
    try {
      // For mobile devices, try to open in the same window
      if (this.isMobileDevice()) {
        window.location.href = url;
      } else {
        // For desktop, open in new tab
        const popup = window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        if (!popup) {
          // If popup blocked, show toast with manual link
          this.showToast(`Please allow popups to share on ${platform}, or copy the link manually.`);
        }
      }
      
      // Close the modal after sharing
      setTimeout(() => {
        this.dismiss();
      }, 500);
      
    } catch (error) {
      console.error(`Error sharing on ${platform}:`, error);
      this.showToast(`Failed to open ${platform}. Please try copying the link instead.`);
    }
  }

  // Check if device is mobile
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Show toast message
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }
}
