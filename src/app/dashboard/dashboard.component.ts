import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { AngularFirestore } from '@angular/fire/firestore';
import { Title } from '@angular/platform-browser';
import { AuthServiceService } from '../services/auth-service.service';
import { Observable } from 'rxjs';
import { AddTransactionService } from '../services/add-transaction.service';
import * as hash from 'object-hash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userEmail;
  userID;
  details;
  currentBalance = 0;
  cash = {
    amount: 0
  };
  transact = {
    amount: 0,
    to: ''
  };
  prevHashCheck = [];
  currHashCheck = [];
  transactionsList = [];
  accountsList = [];
  blockChainStatus = 'Everything working as expected';
  constructor(private breakpointObserver: BreakpointObserver, private firestore: AngularFirestore, private title: Title,
              private authService: AuthServiceService, private addMoney: AddTransactionService) {
                this.title.setTitle('Blockchain Finance | Overview');
            }

  ngOnInit() {
    this.userEmail = this.authService.getUserDetails().email;
    console.log(this.userEmail);
    this.userID = this.authService.getUserDetails().uid;
    this.firestore.collection('users').doc(this.userID).get().toPromise().then(snap => {
      this.details = snap.data();
      this.getAlltransactions();
      this.getAllAccounts();
    }).catch(err => console.log(err));
  }

  addCash() {
    const amount = this.cash.amount;
    const from = 11111111;
    const to = this.details.account_number;
    const object = {
      amount, to, from
    };
    this.addMoney.createTransaction(object);
  }

  sendMoney() {
    const amount = this.transact.amount;
    const to = parseInt(this.transact.to, 10);
    const from = this.details.account_number;
    if (amount < this.currentBalance) {
        const object = {
          amount, to, from
        };
        this.addMoney.createTransaction(object);
    } else {
      alert('Insufficient Balance');
    }
  }

  getAlltransactions() {
    this.blockChainStatus = 'Calculating Hashes and evaluating';
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
            from, to, amount, timestamp
          };
          const calculatedHash = hash(transactionObject);
          this.prevHashCheck.push(previousHash);
          this.currHashCheck.push(currentHash);
          const checked = this.checkPreviousHash();
          if (checked) {
            this.transactionsList.push(transactionObjectWithTS);
            this.blockChainStatus = 'Everything working as expected';
            if (calculatedHash === currentHash) {
              this.blockChainStatus = 'Everything working as expected';
              if (this.details.account_number === to) {
                this.currentBalance = this.currentBalance + amount;
              }

              if (this.details.account_number === from) {
                this.currentBalance = this.currentBalance - amount;
              }
            } else {
              alert('Blockchain Tampered');
              this.blockChainStatus = `Transaction with hash: ` + currentHash + `
              has been tampered. Check failed at validating transactional details. Account balance will show 0 until issue
              is solved`;
            }
          } else {
            alert('Blockchain Tampered');
            this.blockChainStatus = `Transaction with hash: ` + currentHash + `
            has been tampered. Check failed at validating transactional details. Account balance will show 0 until issue
            is solved`;
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

  getAllAccounts() {
    this.firestore.collection('users').get().subscribe(data => {
      data.forEach(user => {
        if (this.details.account_number !== user.data().account_number) {
          const userName = user.data().name;
          const accountNumberUser = user.data().account_number;
          const userObj = {
            userName, accountNumberUser
          };
          this.accountsList.push(userObj);
        }
      });
    });
  }

  logout() {
    this.authService.logout();
  }
}
