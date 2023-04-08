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
  constructor(private http: HttpRequestService, private storage: StorageService, private router: Router, private modalService: BsModalService) {
    let userRole: any = this.storage.getRole();
    if (userRole && (userRole != 'Admin')) {
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
    if(type == 'Profile' || type == 'Loan'){
      this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    }
    else{
      this.modalRef = this.modalService.show(template);
    }
  }

  updateStatus(status: any){
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

}
