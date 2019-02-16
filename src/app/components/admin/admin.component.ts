import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from 'src/app/app.animations';

@Component({
  selector: 'app-admin',
  template: `
    <div [@routeAnimations]="prepareRoute(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  animations: [
    slideInAnimation
    // animation triggers go here
  ]
})
export class AdminComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
}
