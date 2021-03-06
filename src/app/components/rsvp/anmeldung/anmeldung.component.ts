import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { BreakpointObserver } from '@angular/cdk/layout';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { SnackbarClass } from 'src/app/shared/snackbar.class';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';

import { Event } from '../../../shared/event.model';

interface EventUrl {
  event: string;
  user: string;
  url: string;
}

@Component({
  selector: 'app-anmeldung',
  templateUrl: './anmeldung.component.html',
  styleUrls: ['./anmeldung.component.scss'],
  providers: [SnackbarClass]
})
export class AnmeldungComponent implements OnInit {
  constructor(
    private breakpointObserver: BreakpointObserver,
    public snackbar: SnackbarClass,
    private afs: AngularFirestore,
    private route: ActivatedRoute
  ) { }

  @ViewChild('stepper', { static: false }) stepper;

  checked = true;

  absage = false;
  zusage = false;

  begleitung = false;

  minDate = new Date(2019, 6, 19);
  maxDate = new Date(2019, 6, 21);

  firstFormGroup: FormGroup;
  anzahlFormGroup: FormGroup;
  teilnahmeFormGroup: FormGroup;
  anreiseFormGroup: FormGroup;
  unterkunftFormGroup: FormGroup;

  newRsvpData: Array<any>;

  freitag = new Date(2019, 6, 19);
  samstag = new Date(2019, 6, 20);
  sonntag = new Date(2019, 6, 21, 0, 0, 0, 0);

  newAnreiseDate: Date;
  newAbreiseDate: Date;

  anreise: number;
  abreise: number;
  nights: number;
  unterkuenfte: Array<string>;

  fahrzeugListe: string[] = [
    'PKW',
    'Zug',
    'Mitfahrgelegenheit',
    'Sonstige',
    'in Planung'
  ];

  unterkunftListe: string[] = [
    'Draußen (Zelt, Auto, ...)',
    'Mehrbettzimmer',
    'Einzelzimmer',
    'Gästehaus'
  ];

  eventDoc: AngularFirestoreDocument<Event>;
  event: Observable<Event>;
  eventUrl: string;
  eventId: string;
  userId: string;
  urls: EventUrl;

  calcNights() {
    this.anreise = this.anreiseFormGroup.controls['andate'].value;
    this.abreise = this.anreiseFormGroup.controls['abdate'].value;
    this.nights = (this.abreise - this.anreise) / 86400000; // 86400000 = 1 day (in ms)
    this.unterkuenfte = this.unterkunftFormGroup.controls['unterkuenfte'].value;
  }

  checkRange() {
    const anreise = this.anreiseFormGroup.controls['andate'].value;
    const abreise = this.anreiseFormGroup.controls['abdate'].value;
    if (abreise < anreise) {
      return false;
    } else {
      return true;
    }
  }

  transformDate() {
    if (
      this.anreiseFormGroup.controls['andate'].touched &&
      this.anreiseFormGroup.controls['andate'].valid
    ) {
      this.newAnreiseDate = this.anreiseFormGroup.controls[
        'andate'
      ].value.toDate();
    }
    if (
      this.anreiseFormGroup.controls['abdate'].touched &&
      this.anreiseFormGroup.controls['abdate'].valid
    ) {
      this.newAbreiseDate = this.anreiseFormGroup.controls[
        'abdate'
      ].value.toDate();
    }
    const anReise = this.anreiseFormGroup.controls['anreise'].value;
    const abHolung = this.anreiseFormGroup.controls['abholung'].value;
    const zielBahnhof = this.anreiseFormGroup.controls['zielbahnhof'].value;
    const ankunftsZeit = this.anreiseFormGroup.controls['ankunftszeit'].value;
    this.anreiseFormGroup = new FormGroup({
      anreise: new FormControl(anReise),
      abholung: new FormControl(abHolung),
      zielbahnhof: new FormControl(zielBahnhof),
      ankunftszeit: new FormControl(ankunftsZeit),
      andate: new FormControl(this.newAnreiseDate, Validators.required),
      abdate: new FormControl(this.newAbreiseDate, Validators.required)
    });
    console.log(this.anreiseFormGroup);
  }

  onChanges(): void {
    this.anreiseFormGroup.valueChanges.subscribe(val => {
      this.calcNights();
      this.unterkunftFormGroup = new FormGroup({
        naechte: new FormControl(this.nights),
        unterkuenfte: new FormControl(this.unterkuenfte)
      });
    });
  }

  ngOnInit() {

    this.route.params.subscribe((params: Params) => {

      this.eventUrl = params['eventUrl'];

      const snapshotResult = this.afs.collection('urls', ref =>
        ref.where('url', '==', this.eventUrl)
          .limit(1))
        .snapshotChanges()
        .pipe(mergeMap(url => url));

      snapshotResult.subscribe(doc => {
        this.urls = <EventUrl>doc.payload.doc.data();
        this.eventDoc = this.afs.doc(`users/${this.urls.user}/events/${this.urls.event}`);
        this.eventUrl = this.urls.url;
        this.eventId = this.urls.event;
        this.userId = this.urls.user;
        this.event = this.eventDoc.valueChanges();
      });
    });

    this.firstFormGroup = new FormGroup({
      name: new FormControl(''),
      email: new FormControl('')
    });
    this.teilnahmeFormGroup = new FormGroup({
      teilnahme: new FormControl('')
    });
    this.anzahlFormGroup = new FormGroup({
      begleitung: new FormControl(this.begleitung),
      hund: new FormControl(''),
      kinder: new FormControl('')
    });
    this.anreiseFormGroup = new FormGroup({
      anreise: new FormControl(''),
      abholung: new FormControl(''),
      zielbahnhof: new FormControl(''),
      ankunftszeit: new FormControl(''),
      andate: new FormControl('', Validators.required),
      abdate: new FormControl('', Validators.required)
    });
    this.unterkunftFormGroup = new FormGroup({
      naechte: new FormControl(''),
      unterkuenfte: new FormControl('')
    });
    this.onChanges();
  }

  isMobile() {
    return this.breakpointObserver.isMatched('(max-width: 599px)');
  }

  mergeFG() {
    this.transformDate();
    this.newRsvpData = {
      ...this.firstFormGroup.value,
      ...this.teilnahmeFormGroup.value,
      ...this.anzahlFormGroup.value,
      ...this.anreiseFormGroup.value,
      ...this.unterkunftFormGroup.value
    };
  }

  onSubmit() {
    this.mergeFG();
    console.log(this.newRsvpData);
    this.onSaveData(this.newRsvpData);
    this.zusage = true;
    this.snackbar.openSnackBar(
      'Juhu, toll dass du dabei bist.',
      'Ok',
      2500);
    this.stepper.reset();
  }
  onEarlyExit() {
    this.mergeFG();
    console.log(this.newRsvpData);
    this.onSaveData(this.newRsvpData);
    this.absage = true;
    this.snackbar.openSnackBar(
      'Schade, du wirst nicht eingeplant.',
      'Ok',
      2500
    );
    this.stepper.reset();
  }

  onSaveData(newRsvpData: Array<any>) {
    this.afs.collection(`users/${this.userId}/events/${this.eventId}/rsvp`).add(newRsvpData)
      .then(docRef => {
        console.log('Document added: ', docRef);
      })
      .catch(function (error) {
        console.error('Error adding document: ', error);
      });
  }
}
