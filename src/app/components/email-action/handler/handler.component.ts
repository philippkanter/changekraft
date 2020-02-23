import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { SnackbarClass } from 'src/app/shared/snackbar.class';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-handler',
  templateUrl: './handler.component.html'
})
export class HandlerComponent implements OnInit {
  mode = this.activateRoute.snapshot.queryParams['mode'];
  code = this.activateRoute.snapshot.queryParams['oobCode'];
  title = '';
  text = '';
  error = '';
  errormessage = 'Leider ist ein Fehler aufgetreten. Bitte versuche es erneut.';

  frmSetNewPassword = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor(
    private activateRoute: ActivatedRoute,
    public afAuth: AngularFireAuth,
    private router: Router,
    public snackbar: SnackbarClass,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // check if link includes the oobCode
    if (this.code !== undefined) {
      // check if mode is verifyEmail
      if (this.mode === 'verifyEmail') {
        this.title = 'E-Mail bestätigen';
        this.afAuth.auth
          .applyActionCode(this.code)
          .then(() => {
            this.snackbar.openSnackBar('E-Mail erfolgreich verifiziert.', 'Ok', 2500);
            this.text = 'Die E-Mail-Adresse wurde erfolgreich verifiziert.';
          })
          .catch(err => {
            this.text = this.errormessage;
            this.error = err;
          }
          );
        // check if mode is resetPassword
      } else if (this.mode === 'resetPassword') {
        this.title = 'Passwort zurücksetzen';
        this.text = 'Bitte gib dein neues Passwort ein.';
      }
    } else {
      // oobCode is missing
      this.title = 'Bitte weitergehen..';
      this.text = this.errormessage;
      // this.router.navigate(['./404']);
    }
  }

  setPassword() {
    const password = this.frmSetNewPassword.controls['password'].value;
    const confirmPassword = this.frmSetNewPassword.controls['confirmPassword'].value;
    console.log(password);
    if (password !== confirmPassword) {
      this.snackbar.openSnackBar('Die Passwörter stimmen nicht überein.', 'Ok', 2500);
      return;
    }
    this.afAuth.auth
      .confirmPasswordReset(this.code, password)
      .then(() => this.router.navigate(['./login']))
      .catch(err => {
        this.snackbar.openSnackBar(err.code, 'Ok', 2500);
      });
  }
}
