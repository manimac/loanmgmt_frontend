import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-price-history',
  templateUrl: './price-history.component.html',
  styleUrls: ['./price-history.component.css']
})
export class PriceHistoryComponent implements OnInit {

  showForm: boolean = false;
  formGroup: any;
  dataLists: any = [];
  p: number = 1;
  defaultDate: any = '';
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router) {
    let userRole: any = this.storage.getRole();
    // if (userRole && (userRole != 'Admin')) {
    //   this.router.navigateByUrl("/home");
    // }
  }

  ngOnInit(): void {
    this.loadData();
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    this.defaultDate = `${year}-${month}-${day}`;
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      date: new FormControl(this.defaultDate, Validators.required),
      value: new FormControl('', Validators.required)
    })
  }

  create() {
    this.showForm = true;
  }

  loadData() {
    this.http.post('report/list', { fromdate: this.defaultDate, todate: this.defaultDate }).subscribe(
      (response: any) => {
        if(response){
          let obj = {
            value: response.unitRate
          };
          this.formGroup.patchValue(obj);
        }
        
        console.log(response);
      });
    this.http.get('pricehistory/list').subscribe(
      (response: any) => {
        this.dataLists = response;
      }, (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  viewElement(params: any) {
    this.showForm = true;
    this.formGroup.patchValue(params);
  }

  cancel() {
    this.showForm = false;
    this.formGroup.reset();
  }

  submit() {
    let url = (this.formGroup.value.id) ? 'pricehistory/update' : 'pricehistory/create';
    this.http.post(url, this.formGroup.value).subscribe(
      (response: any) => {
        if (this.formGroup.value.id) {
          this.http.successMessage('Updated');
        }
        else {
          this.http.successMessage('Created');
        }
        this.showForm = false;
        this.formGroup.reset();
        this.loadData();
      },
      (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  deleteElement(id: number) {
    this.http.delete('pricehistory/delete/', id).subscribe(
      (response: any) => {
        this.http.successMessage('Deleted');
        this.showForm = false;
        this.formGroup.reset();
        this.loadData();
      },
      (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

}
