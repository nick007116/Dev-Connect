import React, { useState, useEffect } from "react";
import { auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, db, doc, getDoc } from "../../lib/firebase";
import Login from "./LoginPage";
import Register from "./RegisterPage";

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
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setAuthState({
              user: currentUser,
              isRegistered: true,
              error: null,
              loading: false
            });
            onUserAuthenticated(currentUser, userDoc.data());
          } else {
            setAuthState({
              user: currentUser,
              isRegistered: false,
              error: null,
              loading: false
            });
          }
        } catch (error) {
          setAuthState({
            user: null,
            isRegistered: false,
            error: "Failed to fetch user data",
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
        error: "Failed to login with Google"
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

  if (authState.error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {authState.error}
        </div>
      </div>
    );
  }

  if (!authState.user) {
    return <Login onGoogleLogin={handleGoogleLogin} />;
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