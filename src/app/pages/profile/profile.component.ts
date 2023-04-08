import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  showForm: boolean = false;
  formGroup: any;
  profileLists: any = [];
  p: number = 1;
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router) {
    let userRole: any = this.storage.getRole();
    if (userRole && (userRole != 'Admin')) {
      this.router.navigateByUrl("/home");
    }
  }

  ngOnInit(): void {
    this.loadData();
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      fathername: new FormControl('', Validators.required),
      mobile: new FormControl('', [Validators.required, Validators.minLength(10)]),
      image: new FormControl(''),
      dob: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      nomineename: new FormControl('', Validators.required),
      nomineemobile: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      accountno: new FormControl('', Validators.required),
      ifsc: new FormControl('', Validators.required),
    })
  }

  create() {
    this.showForm = true;
    this.formGroup.reset();
    this.formGroup.patchValue({status: 2})
  }

  getDOB(){
    var date = new Date();
    date.setFullYear( date.getFullYear() - 18 );
    return date.toISOString().split('T')[0];
  }

  loadData() {
    this.p = 1;
    this.http.get('profile/list').subscribe(
      (response: any) => {
        this.profileLists = response;
      }, (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  onThumbnailChange(file: any) {
    this.formGroup.patchValue({
      image: file[0]
    });
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
    this.http.post("profile/isMobileExist", this.formGroup.value).subscribe(
      (response: any) => {
        let url = (this.formGroup.value.id) ? 'profile/update' : 'profile/create';
        let userId = this.storage.getUserId();
        let _form = new FormData();
        _form.append('id', this.formGroup.value.id);
        _form.append('name', this.formGroup.value.name);
        _form.append('fathername', this.formGroup.value.fathername);
        _form.append('mobile', this.formGroup.value.mobile);
        _form.append('image', this.formGroup.value.image);
        _form.append('dob', this.formGroup.value.dob);
        _form.append('gender', this.formGroup.value.gender);
        _form.append('role', this.formGroup.value.role);
        _form.append('address', this.formGroup.value.address);
        _form.append('nomineename', this.formGroup.value.nomineename);
        _form.append('nomineemobile', this.formGroup.value.nomineemobile);
        _form.append('status', this.formGroup.value.id ? this.formGroup.value.status : 2);
        _form.append('accountno', this.formGroup.value.accountno);
        _form.append('ifsc', this.formGroup.value.ifsc);
        _form.append('maker_id', userId);
        this.http.post(url, _form).subscribe(
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
      },
      (error: any) => {
        this.http.exceptionHandling(error);
      }
    )    
  }

  deleteElement(id: number) {
    this.http.delete('profile/delete/', id).subscribe(
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

  export() {
    let newArray: any[] = [];
    let data: any = Object.values(this.profileLists);
    Object.keys(data).forEach((key: any, index: any) => {
      newArray.push({
        'Name': data[key].name,
        'Mobile': data[key].mobile,
        'Father name': data[key].fathername,
        'DOB': data[key].dob,
        'gender': data[key].gender,
        'Role': data[key].role,
        'Address': data[key].address,
        'Nominee Name': data[key].nomineename,
        'Payout': data[key].nomineemobile,
        'Account No': data[key].accountno,
        'IFSC': data[key].ifsc
      })
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(newArray);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Ind. Searched Data Export');
    XLSX.writeFile(wb, 'Profiles.xlsx');
  }

}