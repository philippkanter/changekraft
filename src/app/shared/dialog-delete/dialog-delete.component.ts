import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from './dialog-data.interface';

@Component({
  selector: 'app-dialog-delete',
  templateUrl: './dialog-delete.component.html'
})
export class DialogDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
