import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileViewComponent } from './pages/profile-view/profile-view.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { PortfoliosComponent } from './pages/portfolios/portfolios.component';
import { ApprovalsComponent } from './pages/approvals/approvals.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { TransactionHistoryComponent } from './pages/transaction-history/transaction-history.component';
import { PriceHistoryComponent } from './pages/price-history/price-history.component';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { LoaderComponent } from './loader/loader.component';
import { LoaderInterceptor } from './services/loader/loader.interceptor';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { AcceptNumberOnlyDirective } from './services/accept-number-only.directive';
import { LoansComponent } from './pages/loans/loans.component';
import { FilterLoansPipe } from './pipes/filter-loans.pipe';
import {NgxPaginationModule} from 'ngx-pagination';
import { AcceptNumberDecimalDirective } from './services/accept-number-decimal.directive';
import { AcceptNumberDecimalAmountDirective } from './services/accept-number-decimal-amount.directive';
import {  TypeaheadModule  } from 'ngx-bootstrap/typeahead';
import { DepositComponent } from './pages/deposit/deposit.component';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    ProfileComponent,
    ProfileViewComponent,
    PortfoliosComponent,
    ApprovalsComponent,
    ReportsComponent,
    TransactionHistoryComponent,
    PriceHistoryComponent,
    LoginComponent,
    LoaderComponent,
    AcceptNumberOnlyDirective,
    LoansComponent,
    FilterLoansPipe,
    AcceptNumberDecimalDirective,
    AcceptNumberDecimalAmountDirective,
    DepositComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    ModalModule,
    NgxPaginationModule,
    TypeaheadModule.forRoot()
    // ToastrModule.forRoot({maxOpened: 1,
    //   progressBar: true,
    //   progressAnimation: 'decreasing',
    //   preventDuplicates: true,})
  ],
  providers: [
    {
       provide: HTTP_INTERCEPTORS,
       useClass: LoaderInterceptor,
       multi: true,
    },
    BsModalService
 ],
  bootstrap: [AppComponent]
})
export class AppModule { }
