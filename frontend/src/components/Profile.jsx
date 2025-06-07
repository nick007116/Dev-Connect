import React, { useState } from 'react';
import { ArrowLeft, Edit, Camera, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";

const Profile = ({ userData, onUpdateProfile, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const auth = getAuth();
    
    try {
      await signOut(auth);
      navigate('/logout');
      setTimeout(() => {
        onLogout();
      }, 3000);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleSaveProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ name, bio });
    }
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Profile</h1>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Edit className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img 
              src={userData.profilePic} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold text-center border-b-2 border-blue-500 bg-transparent focus:outline-none px-2 py-1"
            />
          ) : (
            <h2 className="text-2xl font-bold">{userData.name}</h2>
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">About</h3>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-32 border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
              placeholder="Write something about yourself..."
            />
          ) : (
            <p className="text-gray-600">{userData.bio || "No bio yet."}</p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <button 
            onClick={handleSaveProfile}
            className="w-full py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-500 text-white rounded-xl shadow-md hover:bg-red-600 transition-colors"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : "Logout"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;