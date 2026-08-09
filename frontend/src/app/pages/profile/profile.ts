import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileService } from '../../features/profile/profile.service';
import { UserProfile } from '../../features/profile/profile.models';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmNewPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  readonly profile = signal<UserProfile | null>(null);
  readonly isSavingProfile = signal(false);
  readonly isSavingPassword = signal(false);
  readonly profileMessage = signal<string | null>(null);
  readonly passwordMessage = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);

  readonly profileForm;

  readonly passwordForm;

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.maxLength(100)]]
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmNewPassword: ['', [Validators.required]]
      },
      { validators: passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((profile) => {
      this.profile.set(profile);
      this.profileForm.patchValue({ displayName: profile.displayName ?? '' });
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSavingProfile.set(true);
    this.profileMessage.set(null);

    const { displayName } = this.profileForm.getRawValue();

    this.profileService.updateProfile({ displayName: displayName! }).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.isSavingProfile.set(false);
        this.profileMessage.set('Profile updated.');
      },
      error: () => {
        this.isSavingProfile.set(false);
        this.profileMessage.set('Could not update profile.');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isSavingPassword.set(true);
    this.passwordError.set(null);
    this.passwordMessage.set(null);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.profileService.changePassword({
      currentPassword: currentPassword!,
      newPassword: newPassword!
    }).subscribe({
      next: () => {
        this.isSavingPassword.set(false);
        this.passwordMessage.set('Password changed successfully.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSavingPassword.set(false);
        this.passwordError.set(err?.error?.title ?? 'Could not change password.');
      }
    });
  }
}
