import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Event } from '../../../shared/event.model';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from '../zusagen/dialog-delete.component';
import { DialogShareComponent } from './dialog-share.component';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})

export class EventListComponent implements OnInit, OnDestroy {

  event$: Observable<any>;
  shareVar: any;
  counter: number;
  userId: string;
  subscription: Subscription;
  eventData: Array<any>;

  private eventCollection: AngularFirestoreCollection;

  constructor(
    private authservice: AuthService,
    private afs: AngularFirestore,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getEventData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async fetchDataforExcel() {
    this.subscription = this.event$.subscribe(rsvp => {
      this.eventData = rsvp;
      for (let x = 0; x < this.eventData.length; x++) {
        this.counter = 1 + x;
        console.log(this.counter);
      }
    });
  }

  async getEventData(){
    this.userId = (await (this.authservice.getCurrentUser())).uid;
    this.eventCollection = this.afs.collection(`users/${this.userId}/events`);
    this.event$ = this.eventCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Event;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
    this.fetchDataforExcel();
  }

  share(title: string, text: string, url: string) {
    this.shareVar = window.navigator;
    if (this.shareVar && this.shareVar.share) {
      this.shareVar.share({
        title: url,
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

  deleteDialog(id: string, name: string) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      // width: '250px',
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
    this.dialog.open(DialogShareComponent, {
      // width: '250px',
      data: { title: title, text: text, url: url }
    });
  }

}
