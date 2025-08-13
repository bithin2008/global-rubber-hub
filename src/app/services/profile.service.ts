import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileImageSubject = new BehaviorSubject<string>('');
  private userNameSubject = new BehaviorSubject<string>('');
  
  public profileImage$: Observable<string> = this.profileImageSubject.asObservable();
  public userName$: Observable<string> = this.userNameSubject.asObservable();

  constructor(private walletService: WalletService) {
    // Initialize with data from localStorage if available
    const savedProfileImage = localStorage.getItem('userProfileImage');
    const savedUserName = localStorage.getItem('userName');
    
    if (savedProfileImage) {
      this.profileImageSubject.next(savedProfileImage);
    }
    
    if (savedUserName) {
      this.userNameSubject.next(savedUserName);
    }
  }

  updateProfileImage(imageUrl: string): void {
    this.profileImageSubject.next(imageUrl);
    // Persist to localStorage
    if (imageUrl) {
      localStorage.setItem('userProfileImage', imageUrl);
    } else {
      localStorage.removeItem('userProfileImage');
    }
  }

  updateUserName(name: string): void {
    this.userNameSubject.next(name);
    // Persist to localStorage
    if (name) {
      localStorage.setItem('userName', name);
    } else {
      localStorage.removeItem('userName');
    }
  }

  getCurrentProfileImage(): string {
    return this.profileImageSubject.value;
  }

  getCurrentUserName(): string {
    return this.userNameSubject.value;
  }

  clearProfile(): void {
    this.profileImageSubject.next('');
    this.userNameSubject.next('');
    localStorage.removeItem('userProfileImage');
    localStorage.removeItem('userName');
  }

  /**
   * Update profile data including wallet balance from API response
   * @param profileData - Profile data from API
   */
  updateProfileFromAPI(profileData: any): void {
    // Update profile image if available
    if (profileData.profile_image || profileData.user_image) {
      this.updateProfileImage(profileData.profile_image || profileData.user_image);
    }

    // Update user name if available
    if (profileData.full_name || profileData.name) {
      this.updateUserName(profileData.full_name || profileData.name);
    }

    // Update wallet balance if available
    if (profileData.points !== undefined && profileData.points !== null) {
      this.walletService.updateWalletBalance(parseFloat(profileData.points));
    }
  }

  /**
   * Update wallet balance specifically
   * @param balance - New wallet balance
   */
  updateWalletBalance(balance: number): void {
    this.walletService.updateWalletBalance(balance);
  }
}