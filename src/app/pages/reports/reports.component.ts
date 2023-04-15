import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  userRole: any = ''
  fromDate: any = ''
  toDate: any = ''
  loanTable: any = {
    newLoansTrans: '',
    newLoansAmount: '',
    loanRepaymentsTrans: '',
    loanRepaymentsAmount: '',
    unitPurchasedTrans: '',
    unitPurchasedAmount: '',
    unitRedeemedTrans: '',
    unitRedeemedAmount: '',
    activeLoan: '',
    activeLoanAmount: '',
    activeLoanInterest: '',
    totalLoanInterest: '',
    cash: '',
    bank: '',
    netAsset: '',
    noOfOverdue: '',
    overduePrinciple: '',
    overdueInterest: '',
    totalOverdue: '',
    noOfInvestments: '',
    noOfUnits: '',
    unitRate: '',
  }
  modalRef: any;
  paymentType: any = '';
  paymentFormGroup: any;
  currentCashValue: any;
  currentBankValue: any;
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router, private modalService: BsModalService) {
    let userRole: any = this.storage.getRole();
    this.userRole = userRole;
    if (userRole && (userRole != 'Admin' && userRole != 'Manager')) {
      this.router.navigateByUrl("/home");
    }
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
    this.search();
    this.paymentFormGroup = new FormGroup({
      id: new FormControl(''),
      type: new FormControl(''),
      value: new FormControl('', Validators.required),
      status: new FormControl(2)
    })
  }

  search() {
    this.http.post('report/list', { fromdate: this.fromDate, todate: this.toDate }).subscribe(
      (response: any) => {
        this.loanTable = response;
        console.log(response);
      });
    this.http.get('payment/list').subscribe(
      (response: any) => {
        if(response && Array.isArray(response) && (response.length>0)){
          response.forEach((element: any)=>{
            if(element.type == 'cash'){
              this.currentCashValue = element.value;
            }
            if(element.type == 'bank'){
              this.currentBankValue = element.value;
            }
          })
        }
      });
  }

  openModal(template: TemplateRef<any>, type: any) {
    this.paymentType = type;
    let obj = {type: type};
    this.paymentFormGroup.patchValue(obj);
    this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
  }

  savepayment(){
    let cash: any = this.currentCashValue;
    let bank: any = this.currentBankValue;
    let error = 0;
    if(this.paymentType == 'cash'){      
      if(Number(this.paymentFormGroup.value.value) > Number(bank)){
        error = 1;
      }
      else{
        cash = Number(cash) + Number(this.paymentFormGroup.value.value);
        bank = Number(bank) - Number(this.paymentFormGroup.value.value);
      }
    }
    else if(this.paymentType == 'bank'){
      if(Number(this.paymentFormGroup.value.value) > Number(cash)){
        error = 1;
      }
      else{
        cash = Number(cash) - Number(this.paymentFormGroup.value.value);
        bank = Number(bank) + Number(this.paymentFormGroup.value.value);
      }
    }
    if(error == 1){
      this.http.errorMessage("Insufficent balance");
    }
    else{
      this.http.post('payment/update', {cash: cash, bank: bank, type: this.paymentType, value: this.paymentFormGroup.value.value}).subscribe(
        (response: any) => {
          this.paymentFormGroup.reset();
          this.paymentType = '';
          this.modalRef.hide()
          this.search();
        });
    }    
  }

  getCash(loanTable: any){
    return loanTable.cash ? parseFloat(loanTable.cash).toFixed(2) : 0
  }

  getBank(loanTable: any){
    return loanTable.bank ? parseFloat(loanTable.bank).toFixed(2) : 0
  }

}
