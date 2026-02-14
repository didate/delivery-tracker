import { registerLocaleData } from '@angular/common';
import locale from '@angular/common/locales/fr';
import { Component, inject } from '@angular/core';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { fontAwesomeIcons } from './config/font-awesome-icons';
import Main from './layouts/main/main';

@Component({
  selector: 'jhi-app',
  template: '<jhi-main />',
  imports: [Main],
})
export default class App {
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly iconLibrary = inject(FaIconLibrary);

  constructor() {
    this.applicationConfigService.setEndpointPrefix(SERVER_API_URL);
    registerLocaleData(locale);
    this.iconLibrary.addIcons(...fontAwesomeIcons);
  }
}
