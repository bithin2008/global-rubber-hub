import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    ),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    GooglePlus,
    importProvidersFrom(
      IonicModule.forRoot(),
    ),
  ],
});
