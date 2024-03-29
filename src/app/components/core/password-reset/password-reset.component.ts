import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { SnackbarClass } from 'src/app/shared/snackbar.class';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html'
})
export class PasswordResetComponent {

  frmPasswordReset: UntypedFormGroup = this.fb.group({
    email: [null, [Validators.required, Validators.email]]
  });

  disabled = false;

  constructor(
    private afAuth: AngularFireAuth,
    public snackbar: SnackbarClass,
    private fb: UntypedFormBuilder,
    private router: Router) { }

  sendPasswordResetRequest() {
    const email = this.frmPasswordReset.controls['email'].value;
    this.disabled = true;
    this.afAuth.sendPasswordResetEmail(email).then(
      () => {
        // success, show some message
        this.snackbar.openSnackBar('Eine Bestätigungsnachricht wurde versandt.', 'Ok', 2500);
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
