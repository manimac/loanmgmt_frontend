import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent implements OnInit {

  approvalLists: any = [];
  showLoanForm: boolean = false;
  loanFormGroup: any;
  investmentDetails: any = null;
  loanDetails: any = null;
  profileDetails: any = null;
  repaymentDetails: any = null;
  approveDetails: any = {};
  modalRef: any;
  p: number = 1;
  selectedWithdrawDate: any = '';
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router, private modalService: BsModalService) {
    let userRole: any = this.storage.getRole();
    if (userRole && (userRole != 'Admin' && userRole != 'Manager')) {
      this.router.navigateByUrl("/home");
    }
  }

  ngOnInit(): void {
    this.loadData();
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
      status: new FormControl('', Validators.required)
    })
  }

  loadData() {
    this.http.get('approval/pendinglist').subscribe(
      (response: any) => {
        if (response) {
          this.approvalLists = response;
        }
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
        status = 'Active';
      }
    }
    return status;
  }

  cancelLoan() {
    this.showLoanForm = false;
    this.loanFormGroup.reset()
  }

  viewElement(params: any) {
    this.showLoanForm = true;
    this.loanFormGroup.patchValue(params);
  }

  openModal(template: TemplateRef<any>, type: any, approval: any) {
    this.approveDetails = approval;
    // if(type == 'Profile' || type == 'Loan' || type == 'Repayment'){
    this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    // }
    // else{
    //   this.modalRef = this.modalService.show(template);
    // }
  }

  updateStatus(status: any) {
    let obj = JSON.parse(JSON.stringify(this.approveDetails));
    obj['status'] = status;
    let userId = this.storage.getUserId();
    obj['checker_id'] = userId;
    this.http.post("approval/update", obj).subscribe(
      (response: any) => {
        this.http.successMessage('Updated');
        this.modalRef.hide()
        this.loadData()
      },
      (error: any) => {
        this.http.exceptionHandling(error);
      }
    )
  }

  getClosingDate(data: any) {
    const currentDate = new Date(data.createdAt);
    let tenure: any = 1;
    if (data.tenure) {
      let st = data.tenure.split(" ");
      if (data.tenure.length > 0) {
        tenure = st[0];
      }
    }
    currentDate.setFullYear(currentDate.getFullYear() + parseInt(tenure));
    return currentDate;
  }

  checkFutureOrPast(dateToCheck: any) {
    const providedDate = new Date(dateToCheck);
    const currentDate = new Date();
    if (providedDate > currentDate) {
      return true;
    } else {
      return false;
    }
  }

  openAddWithdrawModal(ConfirmWithdrawForm: TemplateRef<any>, data: any, approveDetails: any) {
    if (data.type == 'withdraw') {
      let role = this.storage.getRole();
      this.http.post('profile/searchUnits', { mobile: approveDetails?.profile?.mobile, role: role }).subscribe(
        (response: any) => {
          let numberOfUnits: any = 0;
          let unitsValue: any = 0;
          let investmentLists = [];
          if (response && response.investment) {
            if (role == 'Client') {
              investmentLists = response.investment.filter((element: any) => (element.status != 1));
            }
            else {
              investmentLists = response.investment;
            }
            // this.investmentLists = response.investment;          
            investmentLists.forEach((element: any) => {
              if (element.status == 2) {
                element.units = parseFloat(element.units).toFixed(4);
                if (element.type == 'Redeem') {
                  unitsValue = Number(unitsValue) - Number(element.value);
                  numberOfUnits = Number(numberOfUnits) - Number(element.units);
                }
                else {
                  unitsValue = Number(unitsValue) + Number(element.value);
                  numberOfUnits = Number(numberOfUnits) + Number(element.units);
                }
              }
            });
            numberOfUnits = parseFloat(numberOfUnits).toFixed(4);
          }
          if (response && response.depositAcc && Array.isArray(response.depositAcc) && (response.depositAcc.length > 0)) {
            response.depositAcc.forEach((element1: any) => {
              element1.deposithistories.forEach((element2: any) => {
                if (element2.status == 2) {
                  element2.units = element2.units ? parseFloat(element2.units).toFixed(4) : 0;
                  if (element2.type == 'withdraw') {
                    unitsValue = element2.value ? Number(unitsValue) - Number(element2.value) : unitsValue;
                    numberOfUnits = element2.units ? Number(numberOfUnits) - Number(element2.units) : numberOfUnits;
                  }
                  else {
                    unitsValue = element2.value ? Number(unitsValue) + Number(element2.value) : unitsValue;
                    numberOfUnits = element2.units ? Number(numberOfUnits) + Number(element2.units) : numberOfUnits;
                  }
                }
              });
            });
            numberOfUnits = parseFloat(numberOfUnits).toFixed(4);
          }
          console.log(numberOfUnits);
          if (Number(numberOfUnits) < Number(data.units)) {
            this.http.errorMessage("Please withdraw with in your current value")
          }
          else {
            this.modalRef.hide()
            this.selectedWithdrawDate = '';
            if (this.checkFutureOrPast(this.getClosingDate(data?.deposit))) {
              const today: any = new Date(this.getClosingDate(data?.deposit));
              const yyyy: any = today.getFullYear();
              let mm: any = today.getMonth() + 1; // Months start at 0!
              let dd: any = today.getDate();
              let hh: any = today.getHours();
              let mi: any = today.getMinutes();

              if (dd < 10) dd = '0' + dd;
              if (mm < 10) mm = '0' + mm;

              const formattedToday = dd + '-' + mm + '-' + yyyy + " " + hh + ":" + mi;
              this.selectedWithdrawDate = formattedToday;
              this.modalRef = this.modalService.show(ConfirmWithdrawForm, { class: 'modal-lg', backdrop: 'static' });
            }
            else {
              this.updateStatus(2)
            }
          }
        },
        (error: any) => {
          this.http.exceptionHandling(error);
        }
      )
    }
    else {
      this.updateStatus(2)
    }
  }

}
