import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { AngularFirestore } from '@angular/fire/firestore';
import * as hash from 'object-hash';

@Component({
  selector: 'app-transactions-all',
  templateUrl: './transactions-all.component.html',
  styleUrls: ['./transactions-all.component.css']
})
export class TransactionsAllComponent implements OnInit {
  userEmail;
  userID;
  details;
  prevHashCheck = [];
  currHashCheck = [];
  transactionsList = [];
  currentBalance = 0;
  constructor(private authService: AuthServiceService, private firestore: AngularFirestore) { }

  ngOnInit() {
    this.userEmail = this.authService.getUserDetails().email;
    console.log(this.userEmail);
    this.userID = this.authService.getUserDetails().uid;
    this.firestore.collection('users').doc(this.userID).get().toPromise().then(snap => {
      this.details = snap.data();
      this.getAlltransactions();
    }).catch(err => console.log(err));
  }

  getAlltransactions() {
    this.firestore.collection('transactions', ref => ref.orderBy('timestamp', 'desc')).get().subscribe((data) => {
      if (data.empty) {
        this.currentBalance = 0;
      } else {
        data.forEach((transaction) => {
          const currentHash = transaction.data().currentHash;
          const previousHash = transaction.data().previousHash;
          const from = transaction.data().from;
          const to = transaction.data().to;
          const amount = transaction.data().amount;
          const timestamp = transaction.data().timestamp;
          const transactionID = transaction.data().transactionID;
          const transactionObject = {
            from, to, amount, transactionID
          };
          const transactionObjectWithTS = {
            from, to, amount, timestamp, currentHash, previousHash, transactionID
          };
          const calculatedHash = hash(transactionObject);
          this.prevHashCheck.push(previousHash);
          this.currHashCheck.push(currentHash);
          const checked = this.checkPreviousHash();
          if (checked) {
            this.transactionsList.push(transactionObjectWithTS);
            if (calculatedHash === currentHash) {
              if (this.details.account_number === to) {
                this.currentBalance = this.currentBalance + amount;
              }

              if (this.details.account_number === from) {
                this.currentBalance = this.currentBalance - amount;
              }
            } else {
              alert('Blockchain Tampered');
            }
          } else {
            alert('Blockchain Tampered');
          }
        });
      }
    });
  }

  checkPreviousHash() {
    const hashes = this.prevHashCheck.reverse().slice(1).sort();
    const curr = this.currHashCheck.slice(1).sort();
    console.log(hashes, curr);
    if (JSON.stringify(hashes) === JSON.stringify(curr)) {
      return true;
    } else {
      return false;
    }
  }
}
