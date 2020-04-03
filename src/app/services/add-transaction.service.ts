import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import * as hash from 'object-hash';
import * as uniqid from 'uuid/v4';

@Injectable({
  providedIn: 'root'
})
export class AddTransactionService {

  constructor(private firestore: AngularFirestore) { }

  checkDocExists() {
    const promise = new Promise((resolve, reject) => {
        this.firestore.collection('transactions').get().toPromise().then((snap) => {
          console.log(snap);
          if (snap.empty) {
            resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    return promise;
  }

  getLatestHash() {
    const promise = new Promise((resolve, reject) => {
      this.firestore.collection('transactions', ref => ref.orderBy('timestamp', 'desc').limit(1)).get().toPromise().then((snap) => {
        let prevHash;
        snap.forEach(doc => {
            prevHash = doc.data().currentHash;
          });
        resolve(prevHash);
      });
    });
    return promise;
  }

  createTransaction(transactionDetails) {
    let previousHash;
    let currentHash: string;
    const transactionID = uniqid();
    transactionDetails.transactionID = transactionID;
    currentHash = hash(transactionDetails);
    console.log(transactionDetails, currentHash);
    this.checkDocExists().then((val) => {
      console.log(val);
      if (val) {
        previousHash = null;
        this.addBlock(transactionDetails, previousHash, currentHash, transactionID);
      } else {
        this.getLatestHash().then((data) => {
          previousHash = data;
          this.addBlock(transactionDetails, previousHash, currentHash, transactionID);
        });
      }
    });
  }

  addBlock(details, prev, curr, transactionID) {
    const from = details.from;
    const to = details.to;
    const amount = details.amount;
    const previousHash = prev;
    const currentHash = curr;
    this.firestore.collection('transactions').doc(transactionID).set({
      from, to, amount, previousHash, currentHash, transactionID,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      alert('Added Successfully');
    }).catch((err) => {
      console.log(err);
      alert('Error occured');
    });
  }
}
