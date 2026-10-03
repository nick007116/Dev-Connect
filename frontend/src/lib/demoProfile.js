import { db, doc, getDoc, setDoc } from "./firebase";

export const ensureDemoProfile = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    return userSnapshot.data();
  }

  const profile = {
    name: "DevConnect Demo",
    bio: "Exploring DevConnect",
    profilePic: "https://ui-avatars.com/api/?name=DevConnect+Demo&background=6366f1&color=ffffff&size=128",
    email: user.email || "",
    createdAt: new Date(),
    lastSeen: new Date(),
    online: true,
    isDemo: true
  };

  await setDoc(userRef, profile);
  return profile;
};
