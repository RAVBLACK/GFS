/**
 * Firebase Configuration
 * Phone Authentication Setup
 */

import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure reCAPTCHA for phone authentication
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  try {
    // Clear any existing reCAPTCHA
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will proceed with submit function
        console.log('reCAPTCHA verified successfully');
      },
      'expired-callback': () => {
        console.error('reCAPTCHA expired');
      }
    });

    // Render the verifier
    verifier.render().catch((error) => {
      console.error('Error rendering reCAPTCHA:', error);
    });

    return verifier;
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
    throw error;
  }
};

export default app;
