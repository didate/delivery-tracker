import { NgClass } from '@angular/common';
import { Component, OnInit, Renderer2, RendererFactory2, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';

import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import Footer from '../footer/footer';
import PageRibbon from '../profiles/page-ribbon';
import SidebarComponent from '../sidebar/sidebar.component';
import HeaderComponent from '../header/header.component';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'jhi-main',
  standalone: true,
  templateUrl: './main.html',
  imports: [RouterOutlet, Footer, PageRibbon, SidebarComponent, HeaderComponent, NgClass],
  providers: [AppPageTitleStrategy],
})
export default class Main implements OnInit {
  private readonly renderer: Renderer2;

  account = signal<Account | null>(null);

  private readonly router = inject(Router);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);
  private readonly rootRenderer = inject(RendererFactory2);
  readonly sidebarService = inject(SidebarService);

  constructor() {
    this.renderer = this.rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    // try to log in automatically
    this.accountService.identity().subscribe();

    this.accountService.getAuthenticationState().subscribe(account => {
      this.account.set(account);
    });

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.appPageTitleStrategy.updateTitle(this.router.routerState.snapshot);
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
    });
  }
}
