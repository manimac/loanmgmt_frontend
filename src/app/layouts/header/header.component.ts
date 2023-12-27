import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage/storage.service';
var $: any
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userDetails: any = {};
  userRole = '';
  isEnableStaffAccess: boolean = false;
  isExecutiveAccess: boolean = false;
  isEnableCustomerAccess: boolean = false;
  isEnableAdminAccess: boolean = false;
  isEnableAdminManagerAccess: boolean = false;
  isLoggedIn: boolean = false;
  constructor(private storage: StorageService, private router: Router) {
    this.getUserDetails();
  }

  ngOnInit(): void {
  }

  // ngAfterViewInit() {
  //   /**
  //  * Mobile nav toggle
  //  */
  //   on('click', '.mobile-nav-toggle', function (e) {
  //     select('#navbar').classList.toggle('navbar-mobile')
  //     this.classList.toggle('bi-list')
  //     this.classList.toggle('bi-x')
  //   })

  //   /**
  //    * Mobile nav dropdowns activate
  //    */
  //   on('click', '.navbar .dropdown > a', function (e) {
  //     if (select('#navbar').classList.contains('navbar-mobile')) {
  //       e.preventDefault()
  //       this.nextElementSibling.classList.toggle('dropdown-active')
  //     }
  //   }, true)

  //   /**
  //    * Scrool with ofset on links with a class name .scrollto
  //    */
  //   on('click', '.scrollto', function (e) {
  //     if (select(this.hash)) {
  //       e.preventDefault()

  //       let navbar = select('#navbar')
  //       if (navbar.classList.contains('navbar-mobile')) {
  //         navbar.classList.remove('navbar-mobile')
  //         let navbarToggle = select('.mobile-nav-toggle')
  //         navbarToggle.classList.toggle('bi-list')
  //         navbarToggle.classList.toggle('bi-x')
  //       }
  //       scrollto(this.hash)
  //     }
  //   }, true)
  // }

  toggleNav(){
    let classNames = document.getElementsByClassName("bi-x");
    if(classNames && classNames.length>0){
      let navbar = document.getElementById("navbar");
      if(navbar){
        navbar.classList.toggle('navbar-mobile');
      }
      let navbarMobile = document.getElementById("mobile-nav-tog");
      if(navbarMobile){
        navbarMobile.classList.toggle('bi-list')
        navbarMobile.classList.toggle('bi-x')
      }
    }    
  }

  togglechildNav(){
    let classNames = document.getElementsByClassName("bi-x");
    if(classNames && classNames.length>0){
      let navbar = document.getElementById("childnav");
      if(navbar){
        navbar.classList.toggle('dropdown-active');
      }
    }    
  }

  togglechildprofileNav(){
    let classNames = document.getElementsByClassName("bi-x");
    if(classNames && classNames.length>0){
      let navbar = document.getElementById("childprofileNav");
      if(navbar){
        navbar.classList.toggle('dropdown-active');
      }
    }    
  }

  toggleMobileNav(){
    let navbar = document.getElementById("navbar");
    if(navbar){
      navbar.classList.toggle('navbar-mobile');
    }
    let navbarMobile = document.getElementById("mobile-nav-tog");
    if(navbarMobile){
      navbarMobile.classList.toggle('bi-list')
      navbarMobile.classList.toggle('bi-x')
    }
  }

  getUserDetails() {
    this.userDetails = this.storage.getUserDetails();
    if (this.userDetails) {
      this.userRole = this.userDetails.role;
      if (this.userRole == 'Admin') {
        this.isEnableAdminAccess = true;
      }
      else {
        this.isEnableAdminAccess = false;
      }
      if (this.userRole != 'Client') {
        this.isEnableStaffAccess = true;
      }
      else if (this.userRole) {
        this.isEnableCustomerAccess = true;
      }
      if (this.userRole == 'Admin' || this.userRole == 'Manager') {
        this.isEnableAdminManagerAccess = true;
      }
      else {
        this.isEnableAdminManagerAccess = false;
      }
      if(this.userRole == 'Executive'){
        this.isExecutiveAccess = true;
      }
      this.isLoggedIn = true;
    }
  }

  logout() {
    this.storage.clearUser()
    this.getUserDetails();
    this.router.navigateByUrl("/login");
    setTimeout(() => {
      location.reload();
    })
  }

}
