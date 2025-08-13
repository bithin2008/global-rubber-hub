import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletBalanceSubject = new BehaviorSubject<number>(0);
  public walletBalance$: Observable<number> = this.walletBalanceSubject.asObservable();

  constructor() {
    // Initialize with stored value or default
    const storedBalance = localStorage.getItem('wallet_balance');
    if (storedBalance) {
      this.walletBalanceSubject.next(parseFloat(storedBalance));
    }
  }

  /**
   * Get current wallet balance
   */
  getWalletBalance(): number {
    return this.walletBalanceSubject.value;
  }

  /**
   * Update wallet balance
   * @param balance - New wallet balance
   */
  updateWalletBalance(balance: number): void {
    this.walletBalanceSubject.next(balance);
    // Store in localStorage for persistence
    localStorage.setItem('wallet_balance', balance.toString());
  }

  /**
   * Add amount to wallet balance
   * @param amount - Amount to add
   */
  addToWallet(amount: number): void {
    const currentBalance = this.getWalletBalance();
    this.updateWalletBalance(currentBalance + amount);
  }

  /**
   * Deduct amount from wallet balance
   * @param amount - Amount to deduct
   * @returns boolean - true if deduction was successful, false if insufficient balance
   */
  deductFromWallet(amount: number): boolean {
    const currentBalance = this.getWalletBalance();
    if (currentBalance >= amount) {
      this.updateWalletBalance(currentBalance - amount);
      return true;
    }
    return false;
  }

  /**
   * Reset wallet balance to 0
   */
  resetWallet(): void {
    this.updateWalletBalance(0);
  }

  /**
   * Format wallet balance for display
   * @param balance - Balance to format
   * @returns string - Formatted balance
   */
  formatWalletBalance(balance: number): string {
    return balance.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
}
