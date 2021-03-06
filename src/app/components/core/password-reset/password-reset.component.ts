import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SnackbarClass } from 'src/app/shared/snackbar.class';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html'
})
export class PasswordResetComponent {

  frmPasswordReset: FormGroup = this.fb.group({
    email: [null, [Validators.required, Validators.email]]
  });

  disabled = false;

  constructor(
    private afAuth: AngularFireAuth,
    public snackbar: SnackbarClass,
    private fb: FormBuilder,
    private router: Router) { }

  sendPasswordResetRequest() {
    const email = this.frmPasswordReset.controls['email'].value;
    this.disabled = true;
    this.afAuth.sendPasswordResetEmail(email).then(
      () => {
        // success, show some message
        this.snackbar.openSnackBar('Eine BestÃ¤tigungsnachricht wurde versandt.', 'Ok', 2500);
        this.disabled = false;
      },
      err => {
        // handle errors
        this.snackbar.openSnackBar(err.code, 'Ok', 2500);
        this.disabled = false;
      }
    );
  }

}
