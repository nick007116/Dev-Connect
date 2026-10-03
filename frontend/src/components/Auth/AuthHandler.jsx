import React, { useState, useEffect } from "react";
import { auth, firebaseConfigured, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, db, doc, getDoc } from "../../lib/firebase";
import Login from "./LoginPage";
import Register from "./RegisterPage";

const AuthHandler = ({ onUserAuthenticated, onDemoLogin }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isRegistered: false,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          if (userData) {
            setAuthState({
              user: currentUser,
              isRegistered: true,
              error: null,
              loading: false
            });
            onUserAuthenticated(currentUser, userData);
          } else {
            setAuthState({
              user: currentUser,
              isRegistered: false,
              error: null,
              loading: false
            });
          }
        } catch (error) {
          console.error("Error loading authenticated user profile:", error);
          setAuthState({
            user: null,
            isRegistered: false,
            error: error.message || "Failed to fetch user data",
            loading: false
          });
        }
      } else {
        setAuthState({
          user: null,
          isRegistered: false,
          error: null,
          loading: false
        });
      }
    });

    return () => unsubscribe();
  }, [onUserAuthenticated]);

  const handleGoogleLogin = async () => {
    if (!firebaseConfigured || !auth) {
      setAuthState((prev) => ({
        ...prev,
        error: "Google sign-in is unavailable because Firebase is not configured."
      }));
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || "Failed to login with Google"
      }));
    }
  };

  if (authState.loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authState.user) {
    return (
      <Login
        onGoogleLogin={handleGoogleLogin}
        onDemoLogin={onDemoLogin}
        isLoading={authState.loading}
        error={authState.error}
      />
    );
  }

  if (!authState.isRegistered) {
    return (
      <Register 
        user={authState.user} 
        onCompleteRegistration={() => setAuthState(prev => ({ ...prev, isRegistered: true }))} 
      />
    );
  }

  return null;
};

export default AuthHandler;