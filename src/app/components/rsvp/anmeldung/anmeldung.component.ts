import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { BreakpointObserver } from '@angular/cdk/layout';
import { Response, Http } from '@angular/http';

import { RsvpData } from 'src/app/models/rsvp-data.model';
import { SnackbarClass } from 'src/app/shared/snackbar.class';

@Component({
  selector: 'app-anmeldung',
  templateUrl: './anmeldung.component.html',
  styleUrls: ['./anmeldung.component.scss'],
  providers: [SnackbarClass]
})
export class AnmeldungComponent implements OnInit {
  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private http: Http,
    private route: ActivatedRoute,
    public snackbar: SnackbarClass
  ) {}

  @ViewChild('stepper') stepper;

  checked = true;

  minDate = new Date(2019, 6, 19);
  maxDate = new Date(2019, 6, 21);

  firstFormGroup: FormGroup;
  anzahlFormGroup: FormGroup;
  teilnahmeFormGroup: FormGroup;
  anreiseFormGroup: FormGroup;
  unterkunftFormGroup: FormGroup;

  newRsvpData: RsvpData;

  freitag = new Date(2019, 6, 19);
  samstag = new Date(2019, 6, 20);
  sonntag = new Date(2019, 6, 21, 0, 0, 0, 0);

  anreise: number;
  abreise: number;
  nights: number;
  unterkuenfte: Array<string>;

  unterkunftListe: string[] = [
    'Zelt/Bulli',
    'Mehrbettzimmer',
    'Einzelzimmer',
    'Gästehaus'
  ];

  calcNights() {
    this.anreise = this.anreiseFormGroup.controls['anDate'].value;
    this.abreise = this.anreiseFormGroup.controls['abDate'].value;
    this.nights = (this.abreise - this.anreise) / 86400000; // 86400000 = 1 day (in ms)
    this.unterkuenfte = this.unterkunftFormGroup.controls['unterkuenfte'].value;
  }

  checkRange() {
    const anreise = this.anreiseFormGroup.controls['anDate'].value;
    const abreise = this.anreiseFormGroup.controls['abDate'].value;
    if (abreise < anreise) {
      return false;
    } else {
      return true;
    }
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
    this.firstFormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('')
    });
    this.teilnahmeFormGroup = new FormGroup({
      teilnahme: new FormControl('')
    });
    this.anzahlFormGroup = new FormGroup({
      begleitung: new FormControl(''),
      hund: new FormControl(''),
      kinder: new FormControl('')
    });
    this.anreiseFormGroup = new FormGroup({
      anreise: new FormControl(''),
      anDate: new FormControl('', Validators.required),
      abDate: new FormControl('', Validators.required)
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
    this.router.navigate(['../success'], { relativeTo: this.route });
    this.snackbar.openSnackBar('Juhu, toll dass du dabei bist.', 'Schließen');
    this.stepper.reset();
  }
  onEarlyExit() {
    this.mergeFG();
    console.log(this.newRsvpData);
    this.onSaveData(this.newRsvpData);
    this.router.navigate(['../cancellation'], { relativeTo: this.route });
    this.snackbar.openSnackBar(
      'Schade, du wirst nicht eingeplant.',
      'Schließen'
    );
    this.stepper.reset();
  }

  onSaveData(newRsvpData: RsvpData) {
    this.storeRsvpData(newRsvpData).subscribe((response: Response) => {
      console.log(response);
    });
  }

  storeRsvpData(data: RsvpData) {
    return this.http.post(
      'https://wildwildwuerlich.firebaseio.com/rsvp.json',
      data
    );
  }
}