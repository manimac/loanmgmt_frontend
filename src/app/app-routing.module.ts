import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PortfoliosComponent } from './pages/portfolios/portfolios.component';
import { ApprovalsComponent } from './pages/approvals/approvals.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { TransactionHistoryComponent } from './pages/transaction-history/transaction-history.component';
import { PriceHistoryComponent } from './pages/price-history/price-history.component';
import { LoginComponent } from './pages/login/login.component';
import { LoansComponent } from './pages/loans/loans.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'loans', component: LoansComponent, canActivate: [AuthGuardService] },
  { path: 'portfolios', component: PortfoliosComponent, canActivate: [AuthGuardService] },
  { path: 'approvals', component: ApprovalsComponent, canActivate: [AuthGuardService] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuardService] },
  { path: 'transaction-history', component: TransactionHistoryComponent, canActivate: [AuthGuardService] },
  { path: 'price-history', component: PriceHistoryComponent, canActivate: [AuthGuardService] },
  { path: 'login', component: LoginComponent },
  { path: '**', component: HomeComponent }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})
  ]
})
export class AppRoutingModule { }
