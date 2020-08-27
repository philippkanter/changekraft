import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService } from 'src/app/services/user.service';
import { NgForm } from '@angular/forms';
import { SnackbarClass } from 'src/app/shared/snackbar.class';
import { AuthService } from 'src/app/services/auth.service';
import { DialogUserDeleteComponent } from './dialog-user-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  providers: [SnackbarClass],
  animations: [
    trigger('rotate', [
      transition('state1 => state2', [
        style({ transform: 'rotate(-540deg)' }),
        animate('.8s ease-in-out', style({ transform: 'rotate(0)' }))
      ])
    ])
  ],
})
export class UserProfilComponent implements OnInit {
  animate = 'state1';

  constructor(
    public userService: UserService,
    private snackbar: SnackbarClass,
    private authservice: AuthService,
    public dialog: MatDialog,
    public router: Router) { }

  ngOnInit() {
    this.userService.getUserInfo();
    setTimeout(() => {
      if (!this.userService.verfied) {
        this.snackbar.verificationSnackBar('Bitte E-Mail bestätigen.', 'Link senden');
      }
    }, 300);
  }

  onLogout() {
    this.authservice.logout();
  }

  updateUser(form: NgForm) {
    this.animate = 'state2';
    this.userService.updateUser(form);
    setTimeout(() => {
      this.animate = 'state1';
    }, 1000);
  }

  async deleteDialog() {
    const id = (await this.authservice.getCurrentUser()).uid;
    const name = this.userService.name;
    const user = this.authservice.getCurrentUser();
    const dialogRef = this.dialog.open(DialogUserDeleteComponent, {
      width: '250px',
      data: { id: id, name: name, user: user }
    });

    dialogRef.afterClosed().subscribe(cred => {
      if (cred === undefined) {
        console.log('Der Benutzer wurde nicht gelöscht.');
      } else {
        const email = cred.value.email;
        const password = cred.value.password;
        console.log('Der Benutzer mit der E-Mail ' + email + ' wird gelöscht.');
        this.onReauthenticate(email, password);
      }
    });
  }

  errorSnackbar(errorcode) {
    this.snackbar.openSnackBar('Fehler: ' + errorcode, 'Ok', 2500);
  }

  async onReauthenticate(email, password) {
    const user = this.authservice.getCurrentUser();
    const credential = this.authservice.getCredential(email, password);
    (await user).reauthenticateWithCredential(credential).then(async response => {
      // User re-authenticated.
      (await user).delete().then(promise => {
        // User deleted.
        console.log('Benutzer gelöscht');
        this.router.navigate(['/home']);
      }).catch(error => {
        // An error happened.
        console.log(error);
        this.errorSnackbar(error.code);
      });
    }).catch(error => {
      // An error happened.
      console.log(error);
      this.errorSnackbar(error.code);
    });
  }
}
