import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Event } from '../../../shared/event.model';
import { Observable } from 'rxjs';
import { DialogDeleteComponent } from '../zusagen/dialog-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogShareComponent } from './dialog-share.component';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html'
})
export class EventListComponent implements OnInit {

  event$: Observable<any>;
  shareVar: any;
  counter: number;
  userId: string;
  eventIds: string;
  // eventData: any;
  private eventCollection: AngularFirestoreCollection;
  private rsvpCollection: AngularFirestoreCollection;

  constructor(
    private authservice: AuthService,
    private afs: AngularFirestore,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.userId = (this.authservice.getCurrentUser()).uid;
    this.eventCollection = this.afs.collection(`users/${this.userId}/events`);
    this.event$ = this.eventCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Event;
          // this.eventData = data;
          // console.log(this.eventData);
          const id = a.payload.doc.id;
          this.eventIds = id;
          console.log(this.eventIds);
          return { id, ...data };
        })
      )
    );
    // this.countRSVP();
  }

  // countRSVP() {
  //   for (let x = 0; x < this.eventIds.length; x++) {
  //     this.rsvpCollection = this.afs.collection(`users/${this.userId}/events/${x}/rsvp`);
  //     console.log(this.rsvpCollection);
  //   }
  //   // for (let x = 0; x < this.eventData.length; x++) {
  //   //   this.counter = 1 + x;
  //   // }
  // }

  share(title: string, text: string, url: string) {
    this.shareVar = window.navigator;
    if (this.shareVar && this.shareVar.share) {
      this.shareVar.share({
        title: title,
        text: title + ' – ' + text,
        url: url,
      })
        .then(() => console.log('Successful share'))
        .catch((error: any) => console.log('Error sharing', error));
    } else {
      console.log('No browser support');
      this.shareDialog(title, text, url);
    }
  }

  deleteItem(id: string) {
    const promise = this.eventCollection.doc(id).delete();
    promise
      .then(_ => console.log('Erfolgreich gelöscht.'))
      .catch(err => console.log(err, 'Löschen nicht erlaubt.'));
  }

  openDialog(id: string, name: string) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '250px',
      data: { id: id, name: name }
    });

    dialogRef.afterClosed().subscribe(result => {
      id = result;
      if (id === undefined) {
        console.log('Das Event wurde nicht gelöscht.');
      } else {
        console.log('Das Event mit der ID ' + id + ' wurde gelöscht.');
        this.deleteItem(id);
      }
    });
  }
  shareDialog(title: string, text: string, url: string) {
    const dialogRef = this.dialog.open(DialogShareComponent, {
      width: '250px',
      data: { title: title, text: text, url: url }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   id = result;
    //   if (id === undefined) {
    //     console.log('Das Event wurde nicht gelöscht.');
    //   } else {
    //     console.log('Das Event mit der ID ' + id + ' wurde gelöscht.');
    //     this.deleteItem(id);
    //   }
    // });
  }

}