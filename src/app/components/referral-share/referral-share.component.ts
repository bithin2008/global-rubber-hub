import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonItem, IonLabel, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast, IonSpinner } from '@ionic/angular/standalone';
import { ReferralService } from '../../services/referral.service';
import { CommonService } from '../../services/common-service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-referral-share',
  templateUrl: './referral-share.component.html',
  styleUrls: ['./referral-share.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonToast,
    IonSpinner
  ]
})
export class ReferralShareComponent implements OnInit {
  userReferralCode: string = '';
  referralLink: string = '';
  customSchemeLink: string = '';
  isLoading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';
  referralStats: any = null;

  constructor(
    private referralService: ReferralService,
    private commonService: CommonService,
    private loaderService: LoaderService
  ) {}

  async ngOnInit() {
    await this.loadReferralCode();
    await this.loadReferralStats();
  }

  /**
   * Load user's referral code
   */
  async loadReferralCode() {
    try {
      this.isLoading = true;
      const referralCode = await this.referralService.generateUserReferralCode();
      
      if (referralCode) {
        this.userReferralCode = referralCode;
        this.referralLink = this.referralService.createReferralLink(referralCode);
        this.customSchemeLink = this.referralService.createCustomSchemeReferralLink(referralCode);
      } else {
        this.showToastMessage('Failed to load referral code', 'danger');
      }
    } catch (error) {
      console.error('Error loading referral code:', error);
      this.showToastMessage('Error loading referral code', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load referral statistics
   */
  async loadReferralStats() {
    try {
      this.referralStats = await this.referralService.getReferralStats();
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  }

  /**
   * Share referral link
   */
  async shareReferralLink() {
    try {
      if (!this.userReferralCode) {
        this.showToastMessage('No referral code available', 'danger');
        return;
      }

      await this.referralService.shareReferralLink(this.userReferralCode);
      this.showToastMessage('Referral link shared successfully!', 'success');
    } catch (error) {
      console.error('Error sharing referral link:', error);
      this.showToastMessage('Error sharing referral link', 'danger');
    }
  }

  /**
   * Copy referral link to clipboard
   */
  async copyReferralLink() {
    try {
      if (!this.referralLink) {
        this.showToastMessage('No referral link available', 'danger');
        return;
      }

      await navigator.clipboard.writeText(this.referralLink);
      this.showToastMessage('Referral link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying referral link:', error);
      this.showToastMessage('Error copying referral link', 'danger');
    }
  }

  /**
   * Copy custom scheme link to clipboard
   */
  async copyCustomSchemeLink() {
    try {
      if (!this.customSchemeLink) {
        this.showToastMessage('No custom scheme link available', 'danger');
        return;
      }

      await navigator.clipboard.writeText(this.customSchemeLink);
      this.showToastMessage('Custom scheme link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying custom scheme link:', error);
      this.showToastMessage('Error copying custom scheme link', 'danger');
    }
  }

  /**
   * Generate new referral code
   */
  async generateNewReferralCode() {
    try {
      this.isLoading = true;
      const newCode = await this.referralService.generateUserReferralCode();
      
      if (newCode) {
        this.userReferralCode = newCode;
        this.referralLink = this.referralService.createReferralLink(newCode);
        this.customSchemeLink = this.referralService.createCustomSchemeReferralLink(newCode);
        this.showToastMessage('New referral code generated!', 'success');
      } else {
        this.showToastMessage('Failed to generate new referral code', 'danger');
      }
    } catch (error) {
      console.error('Error generating new referral code:', error);
      this.showToastMessage('Error generating new referral code', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Show toast message
   */
  private showToastMessage(message: string, color: string) {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  /**
   * Dismiss toast
   */
  onToastDismiss() {
    this.showToast = false;
  }
}
