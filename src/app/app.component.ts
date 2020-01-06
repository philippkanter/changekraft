import { Component, OnInit, OnDestroy } from '@angular/core';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  template: '<app-header></app-header>',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  name = '';
  authUnsub: firebase.Unsubscribe;
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    console.log('firebase init');
    firebase.initializeApp({
      apiKey: 'AIzaSyBq3dEPKL4y2rp2QwvWst1LZysjBzhsIWY',
      authDomain: 'wildwildwuerlich.firebaseapp.com',
      databaseURL: 'https://wildwildwuerlich.firebaseio.com',
      projectId: 'wildwildwuerlich',
      storageBucket: 'wildwildwuerlich.appspot.com',
      messagingSenderId: '807799538199'
    });
    this.authUnsub = this.authService.authChange_$();

    this.router.events.subscribe(evt => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy() {
    this.authUnsub();
  }
}
