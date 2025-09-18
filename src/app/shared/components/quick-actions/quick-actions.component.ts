import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuickActionsComponent implements AfterViewInit {
  private footerObserver?: IntersectionObserver;
  isLoggedOut$!: Observable<boolean>;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {
    this.isLoggedOut$ = this.userService.getAuthState().pipe(map((isAuth) => !isAuth));
  }

  onLogout(): void {
    this.userService.logout();
    this.router.navigate(['/home']);
  }
  ngAfterViewInit(): void {
    const footerEl = document.querySelector('app-footer .footer') as Element | null;
    const bar = document.querySelector('.quick-actions-bar') as HTMLElement | null;
    if (!footerEl || !bar) return;
    this.footerObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting === true;
        if (isVisible) bar.classList.add('qa-hidden');
        else bar.classList.remove('qa-hidden');
      },
      { root: null, threshold: 0.01, rootMargin: '0px 0px 120px 0px' },
    );
    this.footerObserver.observe(footerEl);
  }
}
