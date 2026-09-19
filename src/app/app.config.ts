import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
//import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideSweetAlert2 } from '@sweetalert2/ngx-sweetalert2';
import { authInterceptor } from './seguridad/token-interceptor-http';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes, withComponentInputBinding()),// provideAnimations(),
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {subscriptSizing: 'dynamic'}},
    provideMomentDateAdapter({
      parse: {
        dateInput: ['DD-MM-YYYY']
      },
      display: {
        dateInput: 'DD-MM-YYYY',
        monthYearLabel: 'MM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
      }
    }),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideSweetAlert2()
  ]
};
