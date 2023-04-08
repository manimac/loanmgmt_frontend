import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userDetails: any = {};
  userRole = '';
  isEnableStaffAccess: boolean = false;
  isEnableCustomerAccess: boolean = false;
  isEnableAdminAccess: boolean = false;
  isEnableAdminManagerAccess: boolean = false;
  isLoggedIn: boolean = false;
  constructor(private storage: StorageService, private router: Router) {
    this.getUserDetails();
  }

  ngOnInit(): void {
  }

  getUserDetails(){
    this.userDetails = this.storage.getUserDetails();
    if(this.userDetails){
      this.userRole = this.userDetails.role;
      if(this.userRole == 'Admin'){
        this.isEnableAdminAccess = true;
      }
      else{
        this.isEnableAdminAccess = false;
      }
      if(this.userRole != 'Client'){
        this.isEnableStaffAccess = true;
      }
      else if(this.userRole){
        this.isEnableCustomerAccess = true;
      }
      if(this.userRole == 'Admin' || this.userRole == 'Manager'){
        this.isEnableAdminManagerAccess = true;
      }
      else{
        this.isEnableAdminManagerAccess = false;
      }
      this.isLoggedIn = true;
    }
  }

  logout(){
    this.storage.clearUser()
    this.getUserDetails();
    this.router.navigateByUrl("/login");
    setTimeout(()=>{
      location.reload();
    })    
  }

}
