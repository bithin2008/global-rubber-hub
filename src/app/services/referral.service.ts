import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { CommonService } from './common-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private readonly REFERRAL_STORAGE_KEY = 'pending_referral_code';
  private readonly REFERRAL_USED_KEY = 'referral_used';

  constructor(
    private platform: Platform,
    private router: Router,
    private commonService: CommonService
  ) {}

  /**
   * Handle referral code from deep link
   * @param referralCode - The referral code from the deep link
   */
  async handleReferralCode(referralCode: string): Promise<void> {
    try {
      console.log('Handling referral code:', referralCode);
      
      // Validate referral code format
      if (!this.isValidReferralCode(referralCode)) {
        console.warn('Invalid referral code format:', referralCode);
        return;
      }

      // Store referral code for later use
      await this.storeReferralCode(referralCode);
      
      // Check if user is already logged in
      const isLoggedIn = this.isUserLoggedIn();
      
      if (isLoggedIn) {
        // User is logged in, apply referral code immediately
        await this.applyReferralCode(referralCode);
      } else {
        // User is not logged in, store code and redirect to registration
        this.router.navigate(['/register'], { 
          queryParams: { referral: referralCode } 
        });
      }
    } catch (error) {
      console.error('Error handling referral code:', error);
    }
  }

  /**
   * Store referral code for later use
   * @param referralCode - The referral code to store
   */
  async storeReferralCode(referralCode: string): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        // Use Capacitor Preferences for native storage
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({
          key: this.REFERRAL_STORAGE_KEY,
          value: referralCode
        });
      } else {
        // Use localStorage for web
        localStorage.setItem(this.REFERRAL_STORAGE_KEY, referralCode);
      }
      console.log('Referral code stored:', referralCode);
    } catch (error) {
      console.error('Error storing referral code:', error);
      // Fallback to localStorage if Capacitor fails
      localStorage.setItem(this.REFERRAL_STORAGE_KEY, referralCode);
    }
  }

  /**
   * Get stored referral code
   */
  async getStoredReferralCode(): Promise<string | null> {
    try {
      if (this.platform.is('capacitor')) {
        const { Preferences } = await import('@capacitor/preferences');
        const result = await Preferences.get({ key: this.REFERRAL_STORAGE_KEY });
        return result.value;
      } else {
        return localStorage.getItem(this.REFERRAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error getting stored referral code:', error);
      // Fallback to localStorage if Capacitor fails
      return localStorage.getItem(this.REFERRAL_STORAGE_KEY);
    }
  }

  /**
   * Clear stored referral code
   */
  async clearStoredReferralCode(): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key: this.REFERRAL_STORAGE_KEY });
      } else {
        localStorage.removeItem(this.REFERRAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing referral code:', error);
      // Fallback to localStorage if Capacitor fails
      localStorage.removeItem(this.REFERRAL_STORAGE_KEY);
    }
  }

  /**
   * Apply referral code to current user
   * @param referralCode - The referral code to apply
   */
  async applyReferralCode(referralCode: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        return false;
      }

      const data = {
        referral_code: referralCode
      };

      const response = await this.commonService.post('user/apply-referral', data).toPromise();
      
      if (response && response.success) {
        console.log('Referral code applied successfully:', response);
        await this.markReferralAsUsed();
        await this.clearStoredReferralCode();
        return true;
      } else {
        console.warn('Failed to apply referral code:', response?.message);
        return false;
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  }

  /**
   * Generate referral code for current user
   */
  async generateUserReferralCode(): Promise<string | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        return null;
      }

      const response = await this.commonService.get('user/referral-code').toPromise();
      
      if (response && response.success) {
        return response.referral_code;
      } else {
        console.warn('Failed to generate referral code:', response?.message);
        return null;
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      return null;
    }
  }

  /**
   * Create referral deep link
   * @param referralCode - The referral code to include in the link
   */
  createReferralLink(referralCode: string): string {
    const baseUrl = 'https://globalrubberhub.com';
    return `${baseUrl}/referral/${referralCode}`;
  }

  /**
   * Create custom scheme referral link
   * @param referralCode - The referral code to include in the link
   */
  createCustomSchemeReferralLink(referralCode: string): string {
    return `globalrubberhub://referral/${referralCode}`;
  }

  /**
   * Share referral link
   * @param referralCode - The referral code to share
   */
  async shareReferralLink(referralCode: string): Promise<void> {
    try {
      const shareData = {
        title: 'Join Global Rubber Hub',
        text: `Join me on Global Rubber Hub! Use my referral code: ${referralCode}`,
        url: this.createReferralLink(referralCode)
      };

      if (navigator.share && this.platform.is('capacitor')) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await this.copyToClipboard(this.createReferralLink(referralCode));
      }
    } catch (error) {
      console.error('Error sharing referral link:', error);
    }
  }

  /**
   * Copy text to clipboard
   * @param text - Text to copy
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }

  /**
   * Validate referral code format
   * @param code - The referral code to validate
   */
  private isValidReferralCode(code: string): boolean {
    // Basic validation - adjust pattern as needed
    const pattern = /^[A-Z0-9]{6,12}$/;
    return pattern.test(code);
  }

  /**
   * Check if user is logged in
   */
  private isUserLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Mark referral as used
   */
  private async markReferralAsUsed(): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({
          key: this.REFERRAL_USED_KEY,
          value: 'true'
        });
      } else {
        localStorage.setItem(this.REFERRAL_USED_KEY, 'true');
      }
    } catch (error) {
      console.error('Error marking referral as used:', error);
      // Fallback to localStorage if Capacitor fails
      localStorage.setItem(this.REFERRAL_USED_KEY, 'true');
    }
  }

  /**
   * Check if referral has been used
   */
  async hasUsedReferral(): Promise<boolean> {
    try {
      if (this.platform.is('capacitor')) {
        const { Preferences } = await import('@capacitor/preferences');
        const result = await Preferences.get({ key: this.REFERRAL_USED_KEY });
        return result.value === 'true';
      } else {
        return localStorage.getItem(this.REFERRAL_USED_KEY) === 'true';
      }
    } catch (error) {
      console.error('Error checking referral usage:', error);
      // Fallback to localStorage if Capacitor fails
      return localStorage.getItem(this.REFERRAL_USED_KEY) === 'true';
    }
  }

  /**
   * Get referral statistics for current user
   */
  async getReferralStats(): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      const response = await this.commonService.get('user/referral-stats').toPromise();
      return response;
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return null;
    }
  }
}
