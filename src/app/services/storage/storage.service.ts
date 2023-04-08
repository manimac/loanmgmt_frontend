import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  setUserDetails(params: any){
    localStorage.setItem('jwtMDTUserDetails', JSON.stringify(params));
  }

  getUserDetails(){
    let userDetails = localStorage.getItem('jwtMDTUserDetails')
    if(userDetails){
      userDetails = JSON.parse(userDetails);
    }
    return userDetails;
  }

  setRole(params: any){
    localStorage.setItem('jwtMDTUserRole', JSON.stringify(params));
  }

  getRole(){
    let role = localStorage.getItem('jwtMDTUserRole')
    if(role){
      role = JSON.parse(role);
    }
    return role;
  }
  
  getUserId(){
    let userId = '';
    let userDetails: any = localStorage.getItem('jwtMDTUserDetails')
    if(userDetails){
      userDetails = JSON.parse(userDetails);
      if(userDetails && userDetails.id){
        userId = userDetails.id;
      }
    }
    return userId;
  }

  clearUser(){
    localStorage.removeItem('jwtMDTUserRole');
    localStorage.removeItem('jwtMDTUserDetails');
  }
}
