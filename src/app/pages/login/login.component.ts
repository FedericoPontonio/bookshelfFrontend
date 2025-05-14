import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor, etc.
import { ReactiveFormsModule } from '@angular/forms'; // For [formGroup], formControlName
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  errorField: string | null = null
  isLoading =false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: { token: string }) => {
        this.errorMessage = '';
        this.errorField = '';
        this.authService.storeToken(res.token);
        this.isLoading = false;
        this.router.navigate(['/main']);
      },
      error: (err: any) => {
        if (err.status ===401) {
        this.isLoading = false;
          this.errorMessage = 'Invalid credentials'
          setTimeout(()=>{
            this.errorMessage = '';
          }, 2000)
        }
        this.errorMessage = 'Internal server error, login failed.'
        this.isLoading = false;
        setTimeout(()=>{
          this.errorMessage = '';
        }, 5000)
        console.error('Login failed:', err);
      }
    });
  }
}
