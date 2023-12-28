import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {

  approvalLists: any = [];
  investmentDetails: any = null;
  loanDetails: any = null;
  profileDetails: any = null;
  repaymentDetails: any = null;
  approveDetails: any = {};
  fromDate: any = ''
  toDate: any = ''
  p: number = 1;
  mobile: any = '';
  loanId: any = '';
  listedMobiles: any = [];
  filteredItems: string[] = [];

  filterItems() {
    this.filteredItems = this.listedMobiles.filter((item: any) =>
      item.toLowerCase().includes(this.mobile.toLowerCase())
    );
  }

  selectItem(item: string) {
    this.mobile = item;
    this.filteredItems = [];
  }
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router) {
    let userRole: any = this.storage.getRole();
  }

  ngOnInit(): void {
    const today: any = new Date();
    const yyyy: any = today.getFullYear();
    let mm: any = today.getMonth() + 1; // Months start at 0!
    let dd: any = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = yyyy + '-' + mm + '-' + dd;
    this.fromDate = formattedToday;
    this.toDate = formattedToday;
    this.loadData();
  }

  loadData() {
    this.http.post('approval/filterlist', { fromdate: this.fromDate, todate: this.toDate, loan: this.loanId, mobile: this.mobile }).subscribe(
      (response: any) => {
        if (response) {
          this.approvalLists = response;
        }
      },
      (error: any) => {
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

  getStatus(loan: any){
    let status = '';
    if(loan.status == 0){
      status = 'Pending';
    }
    else if(loan.status == 1){
      status = 'Declined';
    } 
    else if(loan.status == 2){
      const today: any = new Date();
      const renewaldate: any = new Date(loan.renewaldate);
      const diffTime = Math.abs(today - renewaldate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if(diffDays > 180){
        status = 'Overdue';
      }
      else if(diffDays > 150){
        status = 'Due';
      }
      else{
        status = 'Active';
      }
    } 
    return status;
  }

  getParticulars(approval: any){
    if(approval.type == 'Investment'){
      if(approval.investment){
        return approval.investment.type;
      }
      else{
        return approval.type;
      }
    }
    else if(approval.type == 'Profile'){
      return 'Profile Update'
    }
    else{
      return approval.type;
    }
  }

  getTransactionId(approval: any){
    if(approval.type == 'Investment'){
        return approval.investment ? approval.investment.id : '';
    }
    else if(approval.type == 'Profile'){
      return approval.profile ? approval.profile.id : '';
    }
    else if(approval.type == 'Repayment'){
      return approval.repaymenthistory ? approval.repaymenthistory.id : '';
    }
    else if(approval.type == 'Loan'){
      return approval.loanhistory ? approval.loanhistory.id : '';
    }
    else{
      return '';
    }
  }

  getUnitsLoanNo(approval: any){
    let data: any = 0;
    if(approval.type == 'Profile'){
      data = '-';
    }
    else if(approval.type == 'Investment'){
      if(approval.investment){
        data = approval.investment.units;
      }
    }
    else if(approval.type == 'Loan'){
      if(approval.loanhistory){
        data = approval.loanhistory.loan_id;
      }
    }
    else if(approval.type == 'Repayment'){
      if(approval.repaymenthistory){
        data = approval.repaymenthistory.loan_id;
      }
    }
    return data;
  }

  getAmount(approval: any){
    let data: any = 0;
    if(approval.type == 'Profile'){
      data = '-';
    }
    else if(approval.type == 'Investment'){
      if(approval.investment){
        data = approval.investment.value;
      }
    }
    else if(approval.type == 'Loan'){
      if(approval.loanhistory){
        data = approval.loanhistory.disbursed;
      }
    }
    else if(approval.type == 'Repayment'){
      if(approval.repaymenthistory){
        data = approval.repaymenthistory.amount;
      }
    }
    return data;
  }

  getRate(approval: any){
    let data: any = 0;
    if(approval.type == 'Profile'){
      data = '-';
    }
    else if(approval.type == 'Investment'){
      if(approval.investment){
        data = approval.investment.rate;
      }
    }
    else if(approval.type == 'Loan'){
      if(approval.loanhistory){
        data = approval.loanhistory.rateofinterest ? approval.loanhistory.rateofinterest + "%" : approval.loanhistory.rateofinterest;
      }
    }
    else if(approval.type == 'Repayment'){
      data = '-';
    }
    return data;
  }

}

