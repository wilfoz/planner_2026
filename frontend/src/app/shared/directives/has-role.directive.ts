import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  @Input() set hasRole(role: string | string[]) {
    let hasPermission = false;
    if (Array.isArray(role)) {
      hasPermission = this.authService.hasAnyRole(role);
    } else {
      hasPermission = this.authService.hasRole(role);
    }

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
