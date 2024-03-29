import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

@Injectable()
export class SnackbarClass {
  constructor(public snackBar: MatSnackBar, public userService: UserService) { }
  public openSnackBar(message: string, action: string, duration: number) {
    this.snackBar.open(message, action, {
      duration: duration
    });
  }

  public reloadSnackBar(message: string, action: string) {
    const snackBarRef = this.snackBar.open(message, action);
    snackBarRef.onAction().subscribe(() => {
      window.location.reload()
    });
  }

  public verificationSnackBar(message: string, action: string) {
    const snackBarRef = this.snackBar.open(message, action);
    snackBarRef.onAction().subscribe(() => {
      this.userService.sendVerification();
    });
  }

  public closeSnackBar() {
    this.snackBar.dismiss();
  }

}
