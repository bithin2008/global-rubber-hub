import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loader-overlay" [class.hidden]="!isLoading">
      <div class="loader-container">
        <img src="assets/img/ajax-loader.gif" alt="Loading...">
        <span class="ion-text-center">Please wait</span>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      left: 0;
      top: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: opacity 0.1s ease-out;
    }

    .loader-overlay.hidden {
      opacity: 0;
      pointer-events: none;
      display: none;
    }

    .loader-container {
      border-radius: 5px;
      display: block;
      justify-content: center;
      align-items: center;
      position: relative;
      width: 170px;
    height: 170px;
    }

    .loader-container:before,
    .loader-container:after {
      position: absolute;
      z-index: -1;
      -webkit-box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      -moz-box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      top: 0;
      bottom: 0;
      left: 10px;
      right: 10px;
      -moz-border-radius: 100px / 10px;
      border-radius: 100px / 10px;
    }

    .loader-container:after {
      right: 10px;
      left: auto;
      -webkit-transform: skew(8deg) rotate(3deg);
      -moz-transform: skew(8deg) rotate(3deg);
      -ms-transform: skew(8deg) rotate(3deg);
      -o-transform: skew(8deg) rotate(3deg);
      transform: skew(8deg) rotate(3deg);
    }

    .loader-overlay img {
     // width: 100px;
    }

    .loader-overlay span {
      margin-top: -25px;
      font-size: 14px;
      font-family: "Baloo Tamma 2", "Roboto Slab";
      font-weight: 400;
      color: #b5b5b5;
      display: block;
    }

    .loader-container .lang-beng {
      font-size: 14px;
      font-weight: 300;
    }
  `]
})
export class LoaderComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.loaderService.loading$.subscribe(loading => {
        this.isLoading = loading;
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
