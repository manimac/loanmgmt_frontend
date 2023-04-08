import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public router: Router, private storage: StorageService) { }

  canActivate(): boolean {
    let userDetails: any = this.storage.getUserDetails()
    if (!userDetails || (userDetails && !userDetails.id)) {
      this.router.navigateByUrl("/login");
    }
    return true;
  }
}
