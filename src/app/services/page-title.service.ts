import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {
  private pageTitleSubject = new BehaviorSubject<string>('Global Rubber Hub');
  public pageTitle$: Observable<string> = this.pageTitleSubject.asObservable();

  constructor() { }

  /**
   * Set the current page title
   * @param title The title to display in the header
   */
  setPageTitle(title: string): void {
    this.pageTitleSubject.next(title);
  }

  /**
   * Get the current page title
   * @returns Current page title
   */
  getCurrentPageTitle(): string {
    return this.pageTitleSubject.value;
  }

  /**
   * Reset to default title
   */
  resetToDefault(): void {
    this.pageTitleSubject.next('Global Rubber Hub');
  }
}