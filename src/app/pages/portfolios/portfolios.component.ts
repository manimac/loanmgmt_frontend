import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.css']
})
export class PortfoliosComponent implements OnInit {

  role: any = '';
  profileDetails: any = {};
  showForm: boolean = false;
  loanFormGroup: any;
  showLoanForm: boolean = false;
  showInvestmentForm: boolean = false;
  investmentFormGroup: any;
  repaymentFormGroup: any;
  searchFormGroup: any;
  loanLists: any = []
  investmentLists: any = []
  repayment: any = []
  isClient: boolean = false;
  loanDetails: any = {};
  numberOfUnits: any = 0;
  unitsValue: any = 0;
  modalRef: any;
  selectedLoan: any;
  selectedHistoryLoan: any;
  minPayment: any = 0;
  reportData: any;
  investmentPage: number = 1;
  loanPage: number = 1;
  repaymentPage: number = 1;
  paymentTypes: any = [];listedMobiles: any = [];
  filteredItems: string[] = [];

  filterItems() {
    this.filteredItems = this.listedMobiles.filter((item: any) =>
      item.toLowerCase().includes(this.searchFormGroup.value.mobile.toLowerCase())
    );
  }

  selectItem(item: string) {
    let obj = {
      mobile: item
    }
    this.searchFormGroup.patchValue(obj);
    this.filteredItems = [];
  }
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router, private modalService: BsModalService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    
    this.loanFormGroup = new FormGroup({
      id: new FormControl(''),
      profile_id: new FormControl('', Validators.required),
      mobile: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      disbursed: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      principle: new FormControl('', Validators.required),
      remarks: new FormControl('', Validators.required),
      renewaldate: new FormControl('', Validators.required),
      rateofinterest: new FormControl('', Validators.required),
      paymenttype: new FormControl('', Validators.required),
      status: new FormControl('Pending', Validators.required)
    }),
      this.investmentFormGroup = new FormGroup({
        id: new FormControl(''),
        units: new FormControl('', Validators.required),
        type: new FormControl('', Validators.required),
        value: new FormControl('', Validators.required),
        status: new FormControl(0, Validators.required),
        rate: new FormControl(''),
        paymenttype: new FormControl('', Validators.required),
        profile_id: new FormControl('', Validators.required)
      })
    this.repaymentFormGroup = new FormGroup({
      id: new FormControl(''),
      amount: new FormControl('', [Validators.required, Validators.min(this.minPayment)]),
      close: new FormControl('', Validators.required),
      status: new FormControl(0, Validators.required),
      principle: new FormControl(''),
      type: new FormControl('', Validators.required),
      profile_id: new FormControl('', Validators.required),
      paymenttype: new FormControl('', Validators.required),
      loan_id: new FormControl('', Validators.required)
    })
    this.searchFormGroup = new FormGroup({
      mobile: new FormControl('', Validators.required)
    })
    this.role = this.storage.getRole();
    if (this.role == 'Client') {
      this.isClient = true;
      let userDetails: any = this.storage.getUserDetails();
      if (userDetails) {
        let obj = { mobile: userDetails.mobile }
        this.searchFormGroup.patchValue(obj);
        this.submit();
      }
    }
    else {
      this.isClient = false;
    }

    if(this.role == 'Admin'){
      this.paymentTypes = [{
        label: 'Cash',
        value: 'cash',
      },{
        label: 'Bank',
        value: 'bank',
      },{
        label: 'AMC',
        value: 'amc',
      }]
    }
    else{
      this.paymentTypes = [{
        label: 'Cash',
        value: 'cash',
      },{
        label: 'Bank',
        value: 'bank',
      }]
    }

    const today: any = new Date();
    const yyyy: any = today.getFullYear();
    let mm: any = today.getMonth() + 1; // Months start at 0!
    let dd: any = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = yyyy + '-' + mm + '-' + dd;

    this.http.post('report/list', { fromdate: formattedToday, todate: formattedToday }).subscribe(
      (response: any) => {
        this.reportData = response;
        if(this.reportData.unitRate){
          this.reportData.unitRate = Number(this.reportData.unitRate).toFixed(4)
        }
        console.log(response);
      });
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
      this.route.queryParams.subscribe(params => {
        // Access individual query parameters
        const mobile = params['mobile'];
        if(mobile){
          let obj = {
            mobile: mobile
          }
          this.searchFormGroup.patchValue(obj);
          this.submit()
        }
      });
  }

  submit() {
    this.profileDetails = {};
    this.investmentFormGroup.reset();
    this.showForm = false;
    this.loanLists = [];
    this.repayment = [];
    this.investmentLists = [];
    this.numberOfUnits = 0;
    this.unitsValue = 0;
    this.investmentPage = 1;
    this.loanPage = 1;
    this.repaymentPage = 1;
    this.http.post('profile/search', { mobile: this.searchFormGroup.value.mobile, role: this.role }).subscribe(
      (response: any) => {
        if (response && response.profile) {
          this.profileDetails = response.profile;
          let obj = { profile_id: this.profileDetails.id };
          this.investmentFormGroup.patchValue(obj)
          this.showForm = true;
        }
        if (response && response.loans) {
          if(this.role == 'Client'){
            this.loanLists = response.loans.filter((element: any)=>(element.status!=1));
          }
          else{
            this.loanLists = response.loans;
          }          
        }
        if (response && response.repayment) {
          if(this.role == 'Client'){
            this.repayment = response.repayment.filter((element: any)=>(element.status!=1));
          }
          else{
            this.repayment = response.repayment;
          }
        }
        if (response && response.investment) {
          if(this.role == 'Client'){
            this.investmentLists = response.investment.filter((element: any)=>(element.status!=1));
          }
          else{
            this.investmentLists = response.investment;
          }
          // this.investmentLists = response.investment;
          this.numberOfUnits = 0;
          this.unitsValue = 0;
          this.investmentLists.forEach((element: any) => {
            if (element.status == 2) {   
              element.units = parseFloat(element.units).toFixed(4);           
              if (element.type == 'Redeem') {
                this.unitsValue = this.unitsValue - Number(element.value);
                this.numberOfUnits = this.numberOfUnits - Number(element.units);
              }
              else {
                this.unitsValue = this.unitsValue + Number(element.value);
                this.numberOfUnits = this.numberOfUnits + Number(element.units);
              }
            }
          });          
          this.numberOfUnits = parseFloat(this.numberOfUnits).toFixed(4);
        }
      },
      (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  changeDisbursed() {
    this.loanFormGroup.patchValue({ principle: this.loanFormGroup.value.disbursed })
  }

  addLoan(template: any) {
    this.showLoanForm = true;
    if (this.profileDetails && this.profileDetails.id) {
      const today: any = new Date();
      const yyyy: any = today.getFullYear();
      let mm: any = today.getMonth() + 1; // Months start at 0!
      let dd: any = today.getDate();

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;

      const formattedToday = dd + '-' + mm + '-' + yyyy;
      const loanDate = yyyy + '-' + mm + '-' + dd;
      let obj = {
        mobile: this.profileDetails.mobile,
        profile_id: this.profileDetails.id,
        date: loanDate,
        renewaldate: loanDate,
        status: 0
      }
      this.loanFormGroup.patchValue(obj);
    }
    this.openLoanModal(template)
  }

  cancelLoan() {
    this.loanDetails = {};
    this.loanFormGroup.reset()
  }

  viewElement(params: any) {
    this.loanDetails = params;
  }

  submitLoan() {
    let url = this.loanFormGroup.value.id ? 'loan/update' : 'loan/create';
    let obj: any = { renewaldate: this.loanFormGroup.value.date };
    this.loanFormGroup.patchValue(obj);
    let userId = this.storage.getUserId();
    this.loanFormGroup.value['maker_id'] = userId;
    this.http.post(url, this.loanFormGroup.value).subscribe(
      (response: any) => {
        if (this.loanFormGroup.value.id) {
          this.http.successMessage('Updated');
        }
        else {
          this.http.successMessage('Created');
        }
        this.modalRef.hide()
        this.loanFormGroup.reset()
        this.submit()
      },
      (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  deleteElement(id: number) {
    this.http.delete('loan/delete/', id).subscribe(
      (response: any) => {
        this.http.successMessage('Deleted');
        this.showLoanForm = false;
        this.loanFormGroup.reset();
        this.submit()
      },
      (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  getStatus(loan: any) {
    let status = '';
    if (loan.status == 0) {
      status = 'Pending';
    }
    else if (loan.status == 1) {
      status = 'Rejected';
    }
    else if (loan.status == 2) {
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
        status = 'Approved';
      }
    }
    else if (loan.status == 3) {
      status = 'Closed';
    }
    return status;
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
      let interestAmount = (loan.principle> 0) ? ((loan.principle * ((loan.rateofinterest) / 100)) / 365) * days : 0
      return interestAmount ? interestAmount.toFixed(2) : 0;
    }
  }

  getBalance(loan: any) {
    let interestAmount: any = this.getInterestAmount(loan);
    return Number(parseFloat(loan.principle) + parseFloat(interestAmount)).toFixed(2);
  }

  openModal(template: TemplateRef<any>) {
    let obj = {
      status: 0,
      profile_id: this.profileDetails.id,
      rate: Number(this.reportData.unitRate).toFixed(4)
    }
    this.investmentFormGroup.patchValue(obj);
    this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
  }

  openLoanModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
  }

  openRepaymentModal(template: TemplateRef<any>, loan: any) {
    let obj = {
      profile_id: loan.profile_id,
      loan_id: loan.id,
      status: 0,
    }
    this.repaymentFormGroup.patchValue(obj);
    this.selectedLoan = loan;
    this.minPayment = Number(this.getInterestAmount(this.selectedLoan));
    this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
  }

  getToday(){
    return new Date().toISOString().split('T')[0]
  }

  saveInvestment() {
    if(this.investmentFormGroup.value.type !='Purchase'){
      this.investmentFormGroup.value.type = 'Redeem';
    }
    if ((this.investmentFormGroup.value.type == 'Purchase') || ((this.investmentFormGroup.value.type == 'Redeem') && (Number(this.numberOfUnits) >= Number(this.investmentFormGroup.value.units)))) {
      let userId = this.storage.getUserId();
      this.investmentFormGroup.value['maker_id'] = userId;
      this.http.post('investment/create', this.investmentFormGroup.value).subscribe(
        (response: any) => {
          this.http.successMessage('Investment added');
          this.modalRef.hide()
          this.investmentFormGroup.reset()
          this.submit()
        },
        (error: any) => {
          this.http.exceptionHandling(error);
        }
      )
    }
    else {
      this.http.errorMessage('Please redeem with in your current value');
    }

  }

  getAmt() {
    let value: any = '';
    let close: any = 0;
    if (this.repaymentFormGroup.value.type == 'Full Payment') {
      value = this.getBalance(this.selectedLoan);
      close = 1;
    }
    else {
      // value = this.getInterestAmount(this.selectedLoan);
      close = 0;
    }
    let obj = {
      amount: value,
      close: close,
    }
    this.repaymentFormGroup.patchValue(obj);
  }

  getMinInterested() {
    if (Number(this.repaymentFormGroup.value.amount) < Number(this.minPayment)) {
      return true;
    }
    return false;
  }

  getMaxPrinciple() {
    if (Number(this.repaymentFormGroup.value.amount) > Number(this.getBalance(this.selectedLoan))) {
      return true;
    }
    return false;
  }

  saveRepayment() {
    let interest = this.getInterestAmount(this.selectedLoan);
    let subprinciple = Number(this.repaymentFormGroup.value.amount) - Number(interest)
    let principle = Number(this.selectedLoan.principle) - Number(subprinciple)
    let obj = {
      principle: principle
    }
    this.repaymentFormGroup.patchValue(obj);
    let userId = this.storage.getUserId();
    this.repaymentFormGroup.value['maker_id'] = userId;
    this.http.post('repayment/create', this.repaymentFormGroup.value).subscribe(
      (response: any) => {
        this.http.successMessage('Submitted');
        this.modalRef.hide()
        this.repaymentFormGroup.reset()
        this.submit()
      },
      (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  updateUnits() {
    let data: any = 0;
    if (Number(this.investmentFormGroup.value.value) && Number(this.investmentFormGroup.value.rate)) {
      data = Number(this.investmentFormGroup.value.value) / Number(this.investmentFormGroup.value.rate);
      data = parseFloat(data).toFixed(2);
      this.investmentFormGroup.patchValue({ units: data });
    }
  }

  updateRedemption(){
    if(this.investmentFormGroup.value.type == 'Full Redemption'){
      let value = (this.numberOfUnits && this.reportData.unitRate) ? Number(this.numberOfUnits) * Number(this.reportData.unitRate) : 0;
      let obj = {units: this.numberOfUnits, value: value};
      this.investmentFormGroup.patchValue(obj);
      this.updateUnits()
    }
  }

  getcurrentValue(){
    let data: any = 0;
    if(this.numberOfUnits && this.reportData && this.reportData.unitRate){
      data = Number(this.numberOfUnits) * Number(this.reportData.unitRate)
    }
    return data ? parseFloat(data).toFixed(4) : data;
  }

  getPrincipal(loan: any){
    return loan.principle ? Number(loan.principle).toFixed(2): loan.principle;
  }

  getRepaymentAmt(data: any){
    return data.amount ? Number(data.amount).toFixed(2): data.amount;
  }  

  openHistoryFormModal(template: TemplateRef<any>, loan: any) {
    this.selectedHistoryLoan = loan;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
  }

}
