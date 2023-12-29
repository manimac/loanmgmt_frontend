import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import * as XLSX from 'xlsx';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-loans',
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.css']
})
export class LoansComponent implements OnInit {

  dataLists: any = [];
  mobile: any = '';
  status: any = '2';
  p: number = 1;
  isEnableAdminManagerAccess: boolean = false;
  listedMobiles: any = [];
  filteredItems: string[] = [];
  selectedLoan: any;
  modalRef: any;

  filterItems() {
    this.filteredItems = this.listedMobiles.filter((item: any) =>
      item.toLowerCase().includes(this.mobile.toLowerCase())
    );
  }

  selectItem(item: string) {
    this.mobile = item;
    this.filteredItems = [];
  }
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router, private modalService: BsModalService) {
    // let userRole: any = this.storage.getRole();
    // if (userRole && (userRole != 'Admin') && (userRole != 'Manager')) {
    //   this.router.navigateByUrl("/home");
    // }
    let userDetails: any = this.storage.getUserDetails();
    if (userDetails) {
      let userRole = userDetails.role;
      if (userRole == 'Admin' || userRole == 'Manager') {
        this.isEnableAdminManagerAccess = true;
      }
      else {
        this.isEnableAdminManagerAccess = false;
      }
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.p = 1;
    this.http.post('loan/filterlist', { mobile: this.mobile, status: this.status }).subscribe(
      (response: any) => {
        this.dataLists = response;
        if (this.dataLists && Array.isArray(this.dataLists) && this.dataLists.length > 0) {
          this.dataLists = response.map((item: any) => {
            item.repaymenthistories = item.repaymenthistories ? item.repaymenthistories.sort((a: any, b: any) => b.id - a.id) : item.repaymenthistories;
            return item;
          });
        }

      }, (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
    this.http.post('loan/filterlistNumbers', {}).subscribe(
      (response: any) => {
        if (response) {
          const mobileArray = response.map((item: any) => item.mobile);
          this.listedMobiles = [...new Set(mobileArray)];
          console.log(this.listedMobiles);
        }
      }, (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  getNumberofDays(dDate: any, status: any) {
    if (status != 2) {
      return 0;
    }
    else {
      var dbDate = new Date(dDate);
      var today = new Date();

      // To calculate the time difference of two dates
      var Difference_In_Time = today.getTime() - dbDate.getTime();

      // To calculate the no. of days between two dates
      var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      if (Difference_In_Days < 0) {
        Difference_In_Days = 1
      }
      return Difference_In_Days ? Math.floor(Difference_In_Days) : Difference_In_Days;
    }
  }

  getInterestAmount(loan: any) {
    if (loan.status != 2) {
      return 0;
    }
    else {
      let days: any = this.getNumberofDays(loan.renewaldate, loan.status);
      let interestAmount = (loan.principle > 0) ? ((loan.principle * ((loan.rateofinterest) / 100)) / 365) * days : 0
      return interestAmount ? interestAmount.toFixed(2) : 0;
    }
  }

  getBalance(loan: any) {
    let interestAmount: any = this.getInterestAmount(loan);
    return Number(parseFloat(loan.principle) + parseFloat(interestAmount)).toFixed(2);
  }

  getStatus(loan: any) {
    let status = '';
    if (loan.status == 0) {
      status = 'Pending';
    }
    else if (loan.status == 1) {
      status = 'Declined';
    }
    else if (loan.status == 2) {
      const today: any = new Date();
      const renewaldate: any = new Date(loan.renewaldate);
      const diffTime = Math.abs(today - renewaldate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 180) {
        status = 'Overdue';
      }
      else if (diffDays > 150) {
        status = 'Due';
      }
      else {
        status = 'Approved';
      }
    }
    else if (loan.status == 3) {
      status = 'Closed';
    }
    return status;
  }

  export() {
    let newArray: any[] = [];
    let data: any = Object.values(this.dataLists);
    Object.keys(data).forEach((key: any, index: any) => {
      newArray.push({
        'Loan Id': data[key].id,
        'Loan Name': data[key].Profile?.name,
        'Mobile': data[key].mobile,
        'Loan Date': data[key].date,
        'Loan Disbursed': data[key].disbursed,
        'Renewal Date': data[key].renewaldate,
        'Prinicipal O/S': data[key].principle,
        'No of Days': this.getNumberofDays(data[key].renewaldate, data[key].status),
        'Interst Amount': this.getInterestAmount(data[key]),
        'Balance': this.getBalance(data[key]),
        'Status': this.getStatus(data[key])
      })
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(newArray);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Ind. Searched Data Export');
    XLSX.writeFile(wb, 'Loans.xlsx');
  }

  sendReminder() {
    this.http.get('eventDueOverdue').subscribe(
      (response: any) => {
        this.http.successMessage("Sent successfully")
        console.log(response)
      }, (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  getPrincipal(loan: any) {
    return loan.principle ? Number(loan.principle).toFixed(2) : loan.principle;
  }

  openRepaymentModal(template: TemplateRef<any>, loan: any) {
    this.selectedLoan = loan;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
  }

  getRepaymentAmt(data: any) {
    return data.amount ? Number(data.amount).toFixed(2) : data.amount;
  }

  getClose(pay: any) {
    let status = '';
    if (pay.close == 1) {
      status = 'Full Payment';
    }
    else {
      status = 'Part Payment';
    }
    return status;
  }

}