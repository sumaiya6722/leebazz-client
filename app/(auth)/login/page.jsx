'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Button,
  FieldError,
  FieldGroup,
  Fieldset,
  Form,
  Input,
  Label,
  TextField,
} from '@heroui/react';
import { authClient } from '../../../lib/auth-client';

export default function LogIn() {
  const route = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries());

    try {
      const { data, error } = await authClient.signIn.email({
        email: user.email,
        password: user.password,
        callbackURL: '/',
      });

      if (data) {
        toast.success('Logged in successfully!');
        setTimeout(() => route.push('/'), 1000);
      } else {
        toast.error(error?.message || 'Something went wrong during log in.');
      }
    } catch (err) {
      console.error('Log in error:', err);
      toast.error('Failed to log in. Please try again.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      await authClient.signIn.social({ provider: 'google', callbackURL: '/' });
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error('Failed to sign in with Google.');
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card-top">
          <span className="login-monogram" aria-hidden="true">l<span>.</span></span>
          <span className="login-top-note">Your Leebazz account</span>
        </div>

        <div className="login-content">
          <span className="eyebrow">Welcome back</span>
          <h1 id="login-title">Good to see you again.</h1>
          <p className="login-intro">Sign in to pick up where you left off and find something lovely for your everyday.</p>

          <Form className="login-form" onSubmit={onSubmit}>
            <Fieldset>
              <FieldGroup className="login-fields">
                <TextField isRequired name="email" type="email" validate={(value) => !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ? 'Please enter a valid email address' : null}>
                  <Label>Email</Label>
                  <Input autoComplete="email" />
                  <FieldError />
                </TextField>

                <TextField isRequired minLength={6} name="password" type="password" validate={(value) => value.length < 6 ? 'Password must be at least 6 characters' : null}>
                  <Label>Password</Label>
                  <Input autoComplete="current-password" />
                  <FieldError />
                </TextField>
              </FieldGroup>

              <Fieldset.Actions className="login-actions">
                <Button type="submit" className="login-submit">Log in <span aria-hidden="true">→</span></Button>
              </Fieldset.Actions>
            </Fieldset>
          </Form>

          <div className="login-divider"><span>or</span></div>
          <button type="button" onClick={signInWithGoogle} className="login-google">
            <svg aria-hidden="true" className="signup-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <p className="login-signup">New to Leebazz? <Link href="/signUp">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}
