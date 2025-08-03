import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileImageSubject = new BehaviorSubject<string>('');
  private userNameSubject = new BehaviorSubject<string>('');
  
  public profileImage$: Observable<string> = this.profileImageSubject.asObservable();
  public userName$: Observable<string> = this.userNameSubject.asObservable();

  constructor() {
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
}