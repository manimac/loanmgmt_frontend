import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formGroup: any;
  showOtp: boolean = false;
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router) {
    let userDetails: any = this.storage.getUserDetails();
    if(userDetails && (userDetails && userDetails.role)){
      this.router.navigateByUrl("/portfolios");
    }
   }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      mobile: new FormControl('', Validators.required),
      otp: new FormControl('')
    })
  }

  submit(){
    if(this.showOtp){
      this.http.post('profile/loginwithotp', this.formGroup.value).subscribe(
        (response: any)=>{
          this.storage.setUserDetails(response);
          if(response.role){
            this.storage.setRole(response.role);
          }
          this.router.navigateByUrl("/portfolios");
          setTimeout(()=>{
            location.reload();
          })          
        },
        (error: any)=>{
          this.http.exceptionHandling(error);
        }
      )
    }
    else{
      this.http.post('profile/login', this.formGroup.value).subscribe(
        (response: any)=>{
          this.showOtp = true;
          let obj = {otp: response};
          this.formGroup.patchValue(obj);
        },
        (error: any)=>{
          this.http.exceptionHandling(error);
        }
      )
    }
  }

}
