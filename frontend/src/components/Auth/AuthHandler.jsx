import React, { useState, useEffect } from "react";
import { auth, GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged, db, doc, getDoc } from "../../lib/firebase";
import Login from "./LoginPage";
import Register from "./RegisterPage";
import { ensureDemoProfile } from "../../lib/demoProfile";

const getDemoSignInError = (error) => {
  if (error.code === "auth/admin-restricted-operation" || error.code === "auth/operation-not-allowed") {
    return "Demo sign-in is disabled for this Firebase project. Enable Authentication > Sign-in method > Anonymous in Firebase Console, then redeploy if you changed frontend environment variables.";
  }

  return error.message || "Failed to open demo account";
};

const AuthHandler = ({ onUserAuthenticated }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isRegistered: false,
    error: null,
    loading: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userData = currentUser.isAnonymous
            ? await ensureDemoProfile(currentUser)
            : await getDoc(doc(db, "users", currentUser.uid)).then((userDoc) => (
              userDoc.exists() ? userDoc.data() : null
            ));
          
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

  const handleDemoLogin = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { user } = await signInAnonymously(auth);
      const userData = await ensureDemoProfile(user);
      setAuthState({
        user,
        isRegistered: true,
        error: null,
        loading: false
      });
      onUserAuthenticated(user, userData);
    } catch (error) {
      console.error("Error signing in to demo account:", error);
      setAuthState((prev) => ({
        ...prev,
        error: getDemoSignInError(error),
        loading: false
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
        onDemoLogin={handleDemoLogin}
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