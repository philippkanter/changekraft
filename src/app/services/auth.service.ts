import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  public token: string;

  user: Observable<User>;

  // get getToken(): string {
  //   return this.token;
  // }

  constructor(private router: Router, private afAuth: AngularFireAuth, private afs: AngularFirestore, ) {
    //// Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  // public authChange_$(): firebase.Unsubscribe {
  //   return this.afAuth.auth.onAuthStateChanged((user: firebase.User) => {
  //     if (user) {
  //       this.getUserToken();
  //     } else {
  //       this.token = null;
  //     }
  //   });
  // }

  private updateUserData(user) {
    // Sets user data to firestore on login

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };

    return userRef.set(data, { merge: true });

  }

  signupUser(email: string, password: string) {
    this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  signinUser(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((credential) => {
        this.updateUserData(credential.user);
        this.getUserToken();
      });
  }

  // signinUser(email: string, password: string) {
  //   const authObject = firebase
  //     .auth()
  //     .signInWithEmailAndPassword(email, password)
  //     .catch()
  //     .then(response => {
  //       this.updateUserData(response.user);
  //       firebase
  //         .auth()
  //         .currentUser.getIdToken()
  //         .then((token: string) => (this._token = token));
  //     });
  //   return authObject;
  // }

  getUserToken() {
    this.afAuth.auth.currentUser.getIdToken()
      .then((token: string) => (this.token = token));
    return this.token;
  }

  getCurrentUser() {
    const currentUser = this.afAuth.auth.currentUser;
    return currentUser;
  }

  isAuthenticated() {
    return this.token != null;
  }

  logout() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
    this.token = null;
  }
}
