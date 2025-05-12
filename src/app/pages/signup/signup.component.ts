import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: '../login/login.component.css'  //use login style to have it consistent
})

export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string | null = null;
  errorField: string | null = null
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    });
    
  }
  

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    const formValue = this.signupForm.value;

    //matching password validation
    const { password, confirmPassword } = this.signupForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = "Passwords do not match";
      this.errorField = "confirmPassword";
      return;
    }
    const userPayload = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password
    };
  this.isLoading = true;
    this.http.post('http://localhost:5154/api/User', userPayload)
      .subscribe({
        next: () => {
          this.errorField = '';
          this.errorMessage = `Successfully created ` + userPayload.name + "'s account";
          setTimeout(()=>{
            this.errorMessage = '';
            this.isLoading = false;
            this.router.navigate(['/login'])
          },2000)

        },
        error: (error) => {
          if (error.status === 409) {
            this.isLoading = false;
            this.errorMessage = 'This email is already in use.';
            this.errorField = 'email'
          } else {
            this.isLoading = false;
            this.errorMessage = 'An unexpected error occurred.';
          }
        }
    
      });
  }
}
