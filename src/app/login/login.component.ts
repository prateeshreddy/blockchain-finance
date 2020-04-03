import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user = {
    email: '',
    password: ''
  };
  errorStatus = false;
  error = '';
  constructor(private authService: AuthServiceService, private router: Router) { }

  ngOnInit() {
  }

  signInWithEmail() {
    this.authService.signInEmailPassword(this.user.email, this.user.password).then((res) => {
      console.log(res);
      this.router.navigate(['/dashboard']);
    }).catch((err) => {
      console.log('error: ' + err);
      this.errorStatus = true;
      this.error = err.message;
    });
  }

}
