'use client';

import Link from 'next/link';
import { authClient } from '../../../lib/auth-client';
import {
  Form,
  Fieldset,
  FieldGroup,
  TextField,
  Label,
  Input,
  Description,
  FieldError,
  Button,
} from '@heroui/react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const route = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries());

    try {
      const { data, error } = await authClient.signUp.email({
        name: user.name,
        email: user.email,
        password: user.password,
        image: user?.image || '',
        callbackURL: '/',
      });

      if (data) {
        toast.success('Signed up successfully!');
        setTimeout(() => route.push('/'), 1000);
      } else {
        toast.error(error?.message || 'Something went wrong during Sign Up!');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      toast.error('Failed to sign up. Please try again.');
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
    <main className="signup-page">
      <div className="signup-aside" aria-hidden="true">
        <span className="signup-aside-kicker">A considered collection</span>
        <p>Find the little things that make a place feel like yours.</p>
        <span className="signup-aside-mark">leebazz<span>.</span></span>
      </div>

      <section className="signup-panel" aria-labelledby="signup-title">
        <div className="signup-heading">
          <span className="eyebrow">Join the community</span>
          <h1 id="signup-title">Create your account</h1>
          <p>Sign up to discover thoughtful finds for everyday living.</p>
        </div>

        <Form className="signup-form" onSubmit={onSubmit}>
          <Fieldset>
            <FieldGroup className="signup-fields">
              <TextField isRequired name="name" validate={(value) => value.length < 3 ? 'Name must be at least 3 characters' : null}>
                <Label>Name</Label>
                <Input autoComplete="name" placeholder="John Doe" />
                <FieldError />
              </TextField>

              <TextField name="image" type="url" validate={(value) => value && !/^https?:\/\/.+/i.test(value) ? 'Please enter a valid image URL (e.g. https://...)' : null}>
                <Label>Profile photo URL <span className="signup-optional">Optional</span></Label>
                <Input placeholder="https://example.com/photo.jpg" />
                <Description>Link to an image you’d like to use as your avatar.</Description>
                <FieldError />
              </TextField>

              <TextField isRequired name="email" type="email" validate={(value) => !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ? 'Please enter a valid email address' : null}>
                <Label>Email</Label>
                <Input autoComplete="email" placeholder="john@example.com" />
                <FieldError />
              </TextField>

              <TextField isRequired minLength={6} name="password" type="password" validate={(value) => {
                if (value.length < 6) return 'Password must be at least 6 characters';
                if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
                if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
                return null;
              }}>
                <Label>Password</Label>
                <Input autoComplete="new-password" placeholder="Create a password" />
                <Description>At least 6 characters, with 1 uppercase letter and 1 number.</Description>
                <FieldError />
              </TextField>
            </FieldGroup>

            <Fieldset.Actions className="signup-actions">
              <Button type="submit" className="signup-submit">Create account</Button>
              <Button type="reset" className="signup-reset" variant="secondary">Clear</Button>
            </Fieldset.Actions>
          </Fieldset>

          <div className="signup-divider"><span>or continue with</span></div>
          <button type="button" onClick={signInWithGoogle} className="signup-google">
            <svg aria-hidden="true" className="signup-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>
          <p className="signup-login">Already have an account? <Link href="/login">Log in</Link></p>
        </Form>
      </section>
    </main>
  );
}
