import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {

  private baseUrl = environment.baseurl;
  
  constructor(private http: HttpClient, private toastr: ToastrService ) { }
  // private toastr: ToastrService
  setHeaders() {
    return ({ 'Access-Control-Allow-Origin': '*', 'Authorization': localStorage.getItem('jwtJezselToken') || '' });
  }

  get(url: any) {
    const headers = this.setHeaders();
    return this.http.get(this.baseUrl + url, { headers });
  }

  post(url: any, body: any) {
    const headers = this.setHeaders();
    return this.http.post(this.baseUrl + url, body, { headers });
  }

  delete(url: any, id: any) {
    const headers = this.setHeaders();
    return this.http.delete(this.baseUrl + url + id, { headers });
  }

  successMessage(message: any){
    this.toastr.success(message);
  }

  errorMessage(message: any){
    this.toastr.error(message);
  }

  exceptionHandling(error: any){
    if(error && error.error && error.error.message){
      this.toastr.error(error.error.message);
    }
    else if(error && error.error){
      this.toastr.error(error.error);
    }
    else{
      this.toastr.error("Request error");
    }
  }


}
