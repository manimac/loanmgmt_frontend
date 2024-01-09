import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import * as XLSX from 'xlsx';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
var $: any

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
  payout: any = ''
  status: any = ''
  mobile: any = ''
  roles: any = [];
  isAdmin: boolean = false;
  listedMobiles: any = [];
  filteredItems: string[] = [];

  filterItems() {
    if(this.mobile){
      this.filteredItems = this.listedMobiles.filter((item: any) =>
      item.toLowerCase().includes(this.mobile.toLowerCase())
    );
    }
    else{
      this.filteredItems = [];
    }    
  }

  selectItem(item: string) {
    this.mobile = item;
    this.filteredItems = [];
  }


  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router) {
    let userRole: any = this.storage.getRole();
    if (userRole && (userRole == 'Client')) {
      this.router.navigateByUrl("/home");
    }
    if (userRole && (userRole == 'Admin')) {
      this.roles = ['Client', 'Admin', 'Manager', 'Executive']
    }
    else if (userRole && (userRole != 'Admin') && (userRole != 'Client')) {
      this.roles = ['Client']
    }
    else {
      this.roles = []
    }
    if (userRole && (userRole == 'Admin')) {
      this.isAdmin = true;
    }
    else {
      this.isAdmin = false;
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
      ifsc: new FormControl('', [Validators.required, Validators.minLength(11)]),
    })
  }

  ngAfterViewInit() {
    // const autocompleteInput = document.getElementById('autocompleteInput');

    // // Initialize the Bootstrap Typeahead
    // $(autocompleteInput).typeahead({
    //   source: this.listedMobiles,
    //   minLength: 1, // Minimum characters to trigger autocomplete
    //   highlight: true, // Highlight matches
    //   autoSelect: true // Auto-select first match
    // });
  }

  create() {
    this.showForm = true;
    this.formGroup.reset();
    this.formGroup.patchValue({ status: 2 })
  }

  getDOB() {
    var date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  }

  loadData() {
    this.p = 1;
    let mobile = this.mobile;
    if(this.mobile){
      let str = this.mobile.split(" (");
      if(str && Array.isArray(str) && str.length>0){
        mobile = str[0];
      }
    }
    this.http.post('profile/filterlist', { mobile: mobile, status: this.status, payout: this.payout }).subscribe(
      (response: any) => {
        if (response && response.entries) {
          this.profileLists = response.entries;

        }

        if (response && response.mobiles) {
          const mobileArray = response.mobiles.map((item: any) => (item.mobile + " (" + item.name + ")"));
          this.listedMobiles = [...new Set(mobileArray)];
          console.log(this.listedMobiles);

        }
        if (response && response.investment) {
          this.profileLists.forEach((element: any) => {
            element['units'] = 0;
            element['unitsvalue'] = 0;
            response.investment.forEach((element2: any) => {
              if (element.id == element2.profile_id) {
                if (element2.type == 'Redeem') {
                  element['units'] = element['units'] - Number(element2.units);
                  element['unitsvalue'] = element['unitsvalue'] - Number(element2.value);
                }
                else {
                  element['units'] = element['units'] + Number(element2.units);
                  element['unitsvalue'] = element['unitsvalue'] + Number(element2.value);
                }
              }
            })
            element['units'] = parseFloat(element['units']).toFixed(2);
          })
        }

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

  _calculateAge(birthday: any) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  submit() {
    var age = this._calculateAge(new Date(this.formGroup.value.dob));

    if (age < 18) {
      this.http.errorMessage('Profile will create for 18years above');
    } else {
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
        'Units': data[key].units,
        'Value': data[key].unitsvalue,
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

  alphaNumberOnly(e: any) {  // Accept only alpha numerics, not special characters 
    var regex = new RegExp("^[a-zA-Z0-9 ]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
      return true;
    }

    e.preventDefault();
    return false;
  }

  onPaste(e: any) {
    e.preventDefault();
    return false;
  }

}