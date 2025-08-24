import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DeepLinkService } from './deep-link.service';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor(
    private platform: Platform,
    private deepLinkService: DeepLinkService
  ) { }

  /**
   * Share item with deep link
   */
  async shareItem(itemId: string, itemTitle: string) {
    const deepLink = this.deepLinkService.createDeepLink(`item/${itemId}`, {
      title: itemTitle
    });

    await this.shareContent({
      title: itemTitle,
      text: `Check out this item: ${itemTitle}`,
      url: deepLink
    });
  }

  /**
   * Share profile with deep link
   */
  async shareProfile(userId: string, userName: string) {
    const deepLink = this.deepLinkService.createDeepLink(`profile/${userId}`, {
      name: userName
    });

    await this.shareContent({
      title: `${userName}'s Profile`,
      text: `Check out ${userName}'s profile on Global Rubber Hub`,
      url: deepLink
    });
  }

  /**
   * Share app with deep link
   */
  async shareApp() {
    const deepLink = this.deepLinkService.createDeepLink('', {
      ref: 'share'
    });

    await this.shareContent({
      title: 'Global Rubber Hub',
      text: 'Join me on Global Rubber Hub - The ultimate platform for rubber trading!',
      url: deepLink
    });
  }

  /**
   * Generic share content method
   */
  private async shareContent(content: { title: string; text: string; url: string }) {
    if (this.platform.is('cordova')) {
      // Use Cordova Social Sharing plugin if available
      if (typeof (window as any).plugins !== 'undefined' && (window as any).plugins.socialsharing) {
        (window as any).plugins.socialsharing.share(
          content.text,
          content.title,
          null,
          content.url
        );
      } else {
        // Fallback to Web Share API
        await this.shareViaWebAPI(content);
      }
    } else {
      // Use Web Share API for web platform
      await this.shareViaWebAPI(content);
    }
  }

  /**
   * Share using Web Share API
   */
  private async shareViaWebAPI(content: { title: string; text: string; url: string }) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.text,
          url: content.url
        });
      } catch (error) {
        console.error('Error sharing:', error);
        this.fallbackShare(content);
      }
    } else {
      this.fallbackShare(content);
    }
  }

  /**
   * Fallback share method (copy to clipboard)
   */
  private fallbackShare(content: { title: string; text: string; url: string }) {
    const shareText = `${content.title}\n\n${content.text}\n\n${content.url}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        // Show success message
        console.log('Content copied to clipboard');
      }).catch(() => {
        this.legacyCopyToClipboard(shareText);
      });
    } else {
      this.legacyCopyToClipboard(shareText);
    }
  }

  /**
   * Legacy copy to clipboard method
   */
  private legacyCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      console.log('Content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
    document.body.removeChild(textArea);
  }
}
