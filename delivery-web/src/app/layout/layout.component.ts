import { Component, inject, signal, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    MatSidenavModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  readonly sidenavOpened = signal(true);

  toggleSidenav(): void {
    if (this.isMobile()) {
      this.sidenav.toggle();
    } else {
      this.sidenavOpened.update(opened => !opened);
    }
  }

  closeSidenavOnMobile(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }
}
