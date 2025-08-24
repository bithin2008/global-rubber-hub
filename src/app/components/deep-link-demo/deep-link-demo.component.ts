import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DeepLinkService } from '../../services/deep-link.service';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-deep-link-demo',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content>
      <ion-header>
        <ion-toolbar>
          <ion-title>Deep Link Demo</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-label>
            <h2>Test Deep Links</h2>
            <p>Click to test different deep link scenarios</p>
          </ion-label>
        </ion-item>

        <ion-item button (click)="testItemLink()">
          <ion-label>
            <h3>Item Link</h3>
            <p>Test item deep link</p>
          </ion-label>
        </ion-item>

        <ion-item button (click)="testProfileLink()">
          <ion-label>
            <h3>Profile Link</h3>
            <p>Test profile deep link</p>
          </ion-label>
        </ion-item>

        <ion-item button (click)="testAddItemLink()">
          <ion-label>
            <h3>Add Item Link</h3>
            <p>Test add item deep link</p>
          </ion-label>
        </ion-item>

        <ion-item button (click)="shareItem()">
          <ion-label>
            <h3>Share Item</h3>
            <p>Share an item with deep link</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list>
        <ion-item>
          <ion-label>
            <h2>Localhost Testing</h2>
            <p>Test deep links directly in browser</p>
          </ion-label>
        </ion-item>

        <ion-item button (click)="testItemLinkDirect()">
          <ion-label>
            <h3>Test Item Direct</h3>
            <p>Navigate to item/123 directly</p>
          </ion-label>
        </ion-item>

        <ion-item button (click)="testProfileLinkDirect()">
          <ion-label>
            <h3>Test Profile Direct</h3>
            <p>Navigate to profile/456 directly</p>
          </ion-label>
        </ion-item>

        <ion-item button (click)="testAddItemLinkDirect()">
          <ion-label>
            <h3>Test Add Item Direct</h3>
            <p>Navigate to item/add directly</p>
          </ion-label>
        </ion-item>

        <ion-item button (click)="shareApp()">
          <ion-label>
            <h3>Share App</h3>
            <p>Share the app with deep link</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list>
        <ion-item>
          <ion-label>
            <h2>Generated Links</h2>
            <p>Copy these links to test</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h3>Item Link</h3>
            <p>{{ itemLink }}</p>
          </ion-label>
          <ion-button slot="end" fill="clear" (click)="copyToClipboard(itemLink)">
            Copy
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-label>
            <h3>Profile Link</h3>
            <p>{{ profileLink }}</p>
          </ion-label>
          <ion-button slot="end" fill="clear" (click)="copyToClipboard(profileLink)">
            Copy
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-label>
            <h3>Custom Link</h3>
            <p>{{ customLink }}</p>
          </ion-label>
          <ion-button slot="end" fill="clear" (click)="copyToClipboard(customLink)">
            Copy
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
    }
    
    ion-label h3 {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    ion-label p {
      color: var(--ion-color-medium);
      font-size: 14px;
    }
  `]
})
export class DeepLinkDemoComponent {
  itemLink: string = '';
  profileLink: string = '';
  customLink: string = '';

  constructor(
    private deepLinkService: DeepLinkService,
    private shareService: ShareService
  ) {
    this.generateLinks();
  }

  generateLinks() {
    this.itemLink = this.deepLinkService.createDeepLink('item/123', {
      title: 'Premium Natural Rubber',
      category: 'natural'
    });

    this.profileLink = this.deepLinkService.createDeepLink('profile/456', {
      name: 'John Doe'
    });

    this.customLink = this.deepLinkService.createDeepLink('bid/history', {
      filter: 'active',
      sort: 'date'
    });
  }

  // Test deep links directly (for localhost testing)
  testItemLinkDirect() {
    this.deepLinkService.testDeepLink('item/123', {
      title: 'Premium Natural Rubber',
      category: 'natural'
    });
  }

  testProfileLinkDirect() {
    this.deepLinkService.testDeepLink('profile/456', {
      name: 'John Doe'
    });
  }

  testAddItemLinkDirect() {
    this.deepLinkService.testDeepLink('item/add');
  }

  testItemLink() {
    const link = this.deepLinkService.createDeepLink('item/123');
    this.openLink(link);
  }

  testProfileLink() {
    const link = this.deepLinkService.createDeepLink('profile/456');
    this.openLink(link);
  }

  testAddItemLink() {
    const link = this.deepLinkService.createDeepLink('item/add');
    this.openLink(link);
  }

  async shareItem() {
    await this.shareService.shareItem('123', 'Premium Natural Rubber');
  }

  async shareApp() {
    await this.shareService.shareApp();
  }

  private openLink(link: string) {
    if (window.open) {
      window.open(link, '_blank');
    } else {
      // Fallback for mobile
      window.location.href = link;
    }
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Link copied to clipboard:', text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}
