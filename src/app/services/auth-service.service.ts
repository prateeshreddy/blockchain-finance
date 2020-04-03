import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;

  constructor(private firebaseAuth: AngularFireAuth, private router: Router) {
    this.user = firebaseAuth.authState;

    this.user.subscribe((user) => {
      if (user) {
        this.userDetails = user;
        console.log(this.userDetails);
      } else {
        this.userDetails = null;
      }
    });
  }

  signInEmailPassword(email, password) {
    const credential = firebase.auth.EmailAuthProvider.credential(email, password);
    return this.firebaseAuth.auth.signInWithEmailAndPassword(email, password);
  }

  isLoggedIn() {
    if (this.userDetails === null) {
      return false;
    } else {
      return true;
    }
  }

  logout() {
    this.firebaseAuth.auth.signOut().then((res) => {
      this.router.navigate(['/login']);
    });
  }

  getUserDetails() {
    return this.firebaseAuth.auth.currentUser;
  }
}
