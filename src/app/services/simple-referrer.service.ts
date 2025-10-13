import { Injectable, Optional, Inject } from '@angular/core';
import { PlayInstallReferrer } from '@ionic-native/play-install-referrer/ngx';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class SimpleReferrerService {
  private readonly REFERRER_STORAGE_KEY = 'app_referrer';

  constructor(
    @Optional() private playInstallReferrer: PlayInstallReferrer,
    @Optional() private storage: Storage
  ) {
    // Don't initialize automatically to avoid circular dependency
    // Call initializeReferrer() manually when needed
  }

  /**
   * Initialize native Play Store referrer capture
   */
  async initializeReferrer() {
    try {
      // Check if dependencies are available
      if (!this.playInstallReferrer || !this.storage) {
        console.log('🔍 Native dependencies not available, skipping native referrer check');
        return;
      }

      // Check if we're on a native platform and the plugin is available
      if (typeof window !== 'undefined' && (window as any).cordova) {
        const ref = await this.playInstallReferrer.getReferrer();
        console.log('🔍 Native Play Store Referrer:', ref);
        
        if (ref) {
          await this.storage.set('installReferrer', ref);
          // Also store in localStorage for immediate access
          localStorage.setItem(this.REFERRER_STORAGE_KEY, ref);
          console.log('✅ Native referrer stored:', ref);
        }
      } else {
        console.log('🔍 Not on native platform, skipping native referrer check');
      }
    } catch (err) {
      console.warn('Could not get install referrer', err);
    }
  }

  /**
   * Check for referrer parameter in URL and store it
   * This should be called when the app starts
   */
  checkAndStoreReferrer(): string | null {
    try {
      console.log('🔍 Checking for referrer...');
      console.log('Current URL:', window.location.href);
      console.log('Document referrer:', document.referrer);

      // First check if we already have a stored referrer (from native or previous checks)
      const storedReferrer = this.getStoredReferrer();
      if (storedReferrer) {
        console.log('✅ Stored referrer found:', storedReferrer);
        return storedReferrer;
      }

      // Check current URL for referrer (including Play Store links)
      const referrerFromCurrentUrl = this.extractReferrerFromCurrentUrl();
      if (referrerFromCurrentUrl) {
        console.log('✅ Referrer found in current URL:', referrerFromCurrentUrl);
        this.storeReferrer(referrerFromCurrentUrl);
        return referrerFromCurrentUrl;
      }

      // Check document.referrer for Play Store links
      const referrerFromDocument = this.extractReferrerFromDocument();
      if (referrerFromDocument) {
        console.log('✅ Referrer found in document:', referrerFromDocument);
        this.storeReferrer(referrerFromDocument);
        return referrerFromDocument;
      }

      console.log('❌ No referrer found');
      return null;
    } catch (error) {
      console.error('Error checking for referrer:', error);
      return null;
    }
  }

  /**
   * Extract referrer from document.referrer (for Play Store links)
   */
  private extractReferrerFromDocument(): string | null {
    try {
      const referrer = document.referrer;
      if (!referrer) return null;

      // Check if referrer is from Google Play Store
      if (referrer.includes('play.google.com/store/apps/details')) {
        const url = new URL(referrer);
        const referrerParam = url.searchParams.get('referrer');
        if (referrerParam) {
          console.log('✅ Play Store referrer extracted:', referrerParam);
          return referrerParam;
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting referrer from document:', error);
      return null;
    }
  }

  /**
   * Extract referrer from current URL (for direct Play Store links)
   */
  private extractReferrerFromCurrentUrl(): string | null {
    try {
      const currentUrl = window.location.href;
      console.log('🔍 Checking current URL for referrer:', currentUrl);

      // Check if current URL is a Play Store link
      if (currentUrl.includes('play.google.com/store/apps/details')) {
        const url = new URL(currentUrl);
        const referrerParam = url.searchParams.get('referrer');
        if (referrerParam) {
          console.log('✅ Play Store referrer found in current URL:', referrerParam);
          return referrerParam;
        }
      }

      // Also check for direct referrer parameter in any URL
      const urlParams = new URLSearchParams(window.location.search);
      const referrerFromUrl = urlParams.get('referrer');
      if (referrerFromUrl) {
        console.log('✅ Referrer found in current URL params:', referrerFromUrl);
        return referrerFromUrl;
      }

      return null;
    } catch (error) {
      console.error('Error extracting referrer from current URL:', error);
      return null;
    }
  }

  /**
   * Store referrer in localStorage
   */
  storeReferrer(referrer: string): void {
    try {
      localStorage.setItem(this.REFERRER_STORAGE_KEY, referrer);
      console.log('✅ Referrer stored:', referrer);
    } catch (error) {
      console.error('Error storing referrer:', error);
    }
  }

  /**
   * Get stored referrer from localStorage
   */
  getStoredReferrer(): string | null {
    try {
      return localStorage.getItem(this.REFERRER_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting stored referrer:', error);
      return null;
    }
  }

  /**
   * Clear stored referrer
   */
  clearReferrer(): void {
    try {
      localStorage.removeItem(this.REFERRER_STORAGE_KEY);
      console.log('✅ Referrer cleared');
    } catch (error) {
      console.error('Error clearing referrer:', error);
    }
  }

  /**
   * Check if referrer exists
   */
  hasReferrer(): boolean {
    return !!this.getStoredReferrer();
  }

  /**
   * Get native install referrer from storage
   */
  async getNativeReferrer(): Promise<string | null> {
    try {
      if (!this.storage) {
        console.log('🔍 Storage not available, skipping native referrer retrieval');
        return null;
      }
      return await this.storage.get('installReferrer');
    } catch (error) {
      console.error('Error getting native referrer:', error);
      return null;
    }
  }
}
