import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class WalletDemoService {

  constructor(
    private walletService: WalletService,
    private profileService: ProfileService
  ) { }

  /**
   * Example: Update wallet balance after a successful transaction
   * @param amount - Transaction amount
   * @param isCredit - true for credit, false for debit
   */
  updateWalletAfterTransaction(amount: number, isCredit: boolean = true): void {
    if (isCredit) {
      this.walletService.addToWallet(amount);
    } else {
      this.walletService.deductFromWallet(amount);
    }
  }

  /**
   * Example: Update wallet from API response
   * @param apiResponse - Response from profile/wallet API
   */
  updateWalletFromAPI(apiResponse: any): void {
    if (apiResponse && apiResponse.wallet_balance !== undefined) {
      this.walletService.updateWalletBalance(parseFloat(apiResponse.wallet_balance));
    }
  }

  /**
   * Example: Update profile and wallet from user API
   * @param userData - User data from API
   */
  updateUserDataFromAPI(userData: any): void {
    // Update profile service which will also update wallet
    this.profileService.updateProfileFromAPI(userData);
  }

  /**
   * Example: Reset wallet on logout
   */
  resetWalletOnLogout(): void {
    this.walletService.resetWallet();
    this.profileService.clearProfile();
  }
}
