import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Event } from '../../../shared/event.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html'
})
export class AddEventComponent implements OnInit {

  eventForm = new FormGroup({
    name: new FormControl('', Validators.required),
    desc: new FormControl('', Validators.required),
    url: new FormControl('', Validators.required),
  });

  constructor(private afs: AngularFirestore, private authservice: AuthService) { }

  userId: string;
  url: string;
  eventData: {};
  event$: Observable<any>;
  private eventCollection: AngularFirestoreCollection;

  ngOnInit() {
    this.userId = this.authservice.getCurrentUser().uid;
    this.eventCollection = this.afs.collection(`users/${this.userId}/event`);
    this.event$ = this.eventCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Event;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
    this.onChanges();
  }

  onChanges(): void {
    this.eventForm.controls['url'].valueChanges.subscribe(val => {
      this.afs.collection('urls', ref => ref.where('url', '==', val));
      return true;
    });
  }

  storeEvent() {
    this.afs.collection(`users/${this.userId}/event`).add(this.eventData)
      .then(docRef => {
        const eventId = docRef.id;
        const urlData = { user: this.userId, event: eventId, url: this.url };
        console.log(urlData);
        this.afs.collection('urls/').add(urlData);
      })
      .catch(function (error) {
        console.error('Error adding document: ', error);
      });
  }

  onSave(eventForm: FormGroup) {
    this.eventData = {
      ...this.eventForm.value
    };
    this.url = this.eventForm.controls['url'].value;
    this.storeEvent();
    console.log(this.onChanges());
  }
}
