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
  resendButton: boolean = false;
  seconds = 60;
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router) {
    let userDetails: any = this.storage.getUserDetails();
    if (userDetails && (userDetails && userDetails.role)) {
      this.router.navigateByUrl("/portfolios");
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      mobile: new FormControl('', Validators.required),
      otp: new FormControl('')
    })
  }

  submit() {
    this.resendButton = false;
    this.seconds = 60;
    if (this.showOtp) {
      this.http.post('profile/loginwithotp', this.formGroup.value).subscribe(
        (response: any) => {
          this.storage.setUserDetails(response);
          if (response.role) {
            this.storage.setRole(response.role);
          }
          this.router.navigateByUrl("/portfolios");
          setTimeout(() => {
            location.reload();
          })
        },
        (error: any) => {
          this.http.exceptionHandling(error);
        }
      )
    }
    else {
      this.http.post('profile/login', this.formGroup.value).subscribe(
        (response: any) => {
          this.showOtp = true;
          setInterval(() => {
            if (this.seconds > 0) {
              this.seconds--;
            }
            else if(this.seconds == 0){
              this.resendButton = true;
            }
          }, 1000)

          // let obj = {otp: response};
          // this.formGroup.patchValue(obj);
        },
        (error: any) => {
          this.http.exceptionHandling(error);
        }
      )
    }
  }

  resend() {
    this.seconds = 60;
    if (!((this.formGroup.invalid || (this.showOtp)) && !this.resendButton)) {
      this.resendButton = false;
      this.http.post('profile/login', this.formGroup.value).subscribe(
        (response: any) => {
          setInterval(() => {
            if (this.seconds > 0) {
              this.seconds--;
            }
            else if(this.seconds == 0){
              this.resendButton = true;
            }
          }, 1000)
        },
        (error: any) => {
          this.http.exceptionHandling(error);
        }
      )
    }

  }

}
