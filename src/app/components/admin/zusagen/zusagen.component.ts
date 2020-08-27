import { Component, OnInit, OnDestroy } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { ExcelService } from 'src/app/services/excel.service';
import { JoinClass } from 'src/app/shared/join.class';
import { DialogDeleteComponent } from './dialog-delete.component';
import { AuthService } from 'src/app/services/auth.service';

// tslint:disable-next-line: no-empty-interface
export interface Rsvp { }

@Component({
  selector: 'app-admin-zusagen',
  templateUrl: './zusagen.component.html',
  styleUrls: ['./zusagen.component.scss'],
  providers: [JoinClass]
})
export class AdminZusagenComponent implements OnInit, OnDestroy {
  excelData: Array<any>;
  subscription: Subscription;

  counter: number;

  editMode = false;

  private rsvpCollection: AngularFirestoreCollection;
  rsvp$: Observable<any>;
  eventId: string;
  userId: string;
  event: Observable<Event>;

  constructor(
    private excelService: ExcelService,
    private authservice: AuthService,
    private afs: AngularFirestore,
    public joinclass: JoinClass,
    public dialog: MatDialog,
    private route: ActivatedRoute,

  ) { }

  ngOnInit() {
    this.getSingleRsvpData();    
  }

  async getSingleRsvpData() {
    this.userId = (await (this.authservice.getCurrentUser())).uid;
    this.route.params.subscribe((params: Params) => {
      this.eventId = params['eventId'];
      this.rsvpCollection = this.afs.collection(`users/${this.userId}/events/${this.eventId}/rsvp`);
      this.rsvp$ = this.rsvpCollection.snapshotChanges().pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as Rsvp;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
      this.fetchDataforExcel();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateItem(id: string, newValue: any) {
    const promise = this.rsvpCollection
      .doc(id)
      .update({ begleitung: newValue });
    promise
      .then(_ => console.log('Erfolgreich geändert.'))
      .catch(err => console.log(err, 'Änderung nicht erlaubt.'));
  }

  deleteItem(id: string) {
    const promise = this.rsvpCollection.doc(id).delete();
    promise
      .then(_ => console.log('Erfolgreich gelöscht.'))
      .catch(err => console.log(err, 'Löschen nicht erlaubt.'));
  }

  exportAsXLSX(): void {
    this.excelService.exportAsExcelFile(this.excelData, 'rsvp');
  }

  fetchDataforExcel() {
    this.subscription = this.rsvp$.subscribe(rsvp => {
      this.excelData = rsvp;
      this.formatDataForExcel();
    });
  }
  formatDataForExcel() {
    for (let x = 0; x < this.excelData.length; x++) {
      this.excelData[x].unterkuenfte = this.joinclass.join(
        this.excelData[x].unterkuenfte,
        ', '
      );

      this.counter = 1 + x;

      if (!this.excelData[x].hund) {
        let hund = this.excelData[x].hund;
        hund = false;
        this.excelData[x].hund = hund;
      }

      if (!this.excelData[x].teilnahme) {
        let teilnahme = this.excelData[x].teilnahme;
        teilnahme = false;
        this.excelData[x].teilnahme = teilnahme;
      }

      if (!this.excelData[x].abholung) {
        let abholung = this.excelData[x].abholung;
        abholung = false;
        this.excelData[x].abholung = abholung;
      }

      if (!this.excelData[x].begleitung) {
        let begleitung = this.excelData[x].begleitung;
        begleitung = false;
        this.excelData[x].begleitung = begleitung;
      }

      if (this.excelData[x].andate) {
        const newAndate = new Date(
          (this.excelData[x].andate.seconds + 3600) * 1000
        );
        if (this.excelData[x].andate !== '') {
          this.excelData[x].andate = newAndate;
        }
      }

      if (this.excelData[x].abdate) {
        const newAbdate = new Date(
          (this.excelData[x].abdate.seconds + 3600) * 1000
        );
        if (this.excelData[x].abdate !== '') {
          this.excelData[x].abdate = newAbdate;
        }
      }

      if (this.excelData[x].kinder !== '') {
        this.excelData[x].kinder = parseInt(this.excelData[x].kinder, 10);
      } else {
        this.excelData[x].kinder = '0';
        this.excelData[x].kinder = parseInt(this.excelData[x].kinder, 10);
      }
    }
  }

  openDialog(id: string, name: string) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      // width: '250px',
      data: { id: id, name: name }
    });

    dialogRef.afterClosed().subscribe(result => {
      id = result;
      if (id === undefined) {
        console.log('Der User wurde nicht gelöscht.');
      } else {
        console.log('Der User mit der ID ' + id + ' wurde gelöscht.');
        this.deleteItem(id);
      }
    });
  }
}
