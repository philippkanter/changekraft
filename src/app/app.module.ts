import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LayoutModule } from '@angular/cdk/layout';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatGridListModule,
  MatCardModule,
  MatMenuModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatInputModule,
  MatNativeDateModule
} from '@angular/material';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';

import { MyNavComponent } from './components/my-nav/my-nav.component';

import { AuthGuard } from './services/auth-guard.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ZusagenComponent } from './pages/zusagen/zusagen.component';
import { RsvpComponent } from './pages/rsvp/rsvp.component';

import { QuestionableBooleanPipe } from './shared/questionableBoolean.pipe';
import { HomeComponent } from './pages/home/home.component';
import { SuccessComponent } from './pages/rsvp/success/success.component';
import { CancellationComponent } from './pages/rsvp/cancellation/cancellation.component';

import { ExcelService } from './services/excel.service';
import { GermanWeek } from './shared/germanWeek.class';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    MyNavComponent,
    RsvpComponent,
    ZusagenComponent,
    QuestionableBooleanPipe,
    HomeComponent,
    SuccessComponent,
    CancellationComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(AppComponent),
    AngularFireDatabaseModule,
    BrowserAnimationsModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MatToolbarModule,
    MatButtonModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    MatBadgeModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  providers: [
    ExcelService,
    AuthGuard,
    AuthService,
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: DateAdapter, useClass: GermanWeek }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    registerLocaleData(localeDe);
  }
}
