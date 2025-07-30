import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Camera, 
  Save, 
  X, 
  Settings, 
  Bell,
  Eye,
  Share2,
  LogOut,
  Users,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Mail,
  Phone,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";
import { motion } from 'framer-motion';
import { rtdb, ref, onValue, set, remove } from '../lib/firebase';

const Profile = ({ userData, onUpdateProfile, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [location, setLocation] = useState(userData?.location || '');
  const [github, setGithub] = useState(userData?.github || '');
  const [twitter, setTwitter] = useState(userData?.twitter || '');
  const [linkedin, setLinkedin] = useState(userData?.linkedin || '');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Track user session
    if (userData?.uid) {
      trackCurrentSession();
    }

    // Check for mobile view
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userData?.uid]);

  const getCurrentDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    let deviceName = 'Unknown Device';
    
    // Simple device detection
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      deviceType = 'mobile';
      deviceName = 'Mobile Device';
    } else {
      deviceName = 'Desktop';
    }

    return {
      type: deviceType,
      name: deviceName,
      sessionId: Date.now() + '-' + Math.random().toString(36).substring(2, 9)
    };
  };

  const trackCurrentSession = async () => {
    if (!userData?.uid) return;
    
    const deviceInfo = getCurrentDeviceInfo();
    const sessionRef = ref(rtdb, `users/${userData.uid}/sessions/${deviceInfo.sessionId}`);
    
    // Store session info
    const sessionData = {
      ...deviceInfo,
      lastActive: Date.now(),
      loginTime: Date.now()
    };
    
    await set(sessionRef, sessionData);
    localStorage.setItem('currentSessionId', deviceInfo.sessionId);
    
    // Update last active time periodically
    const interval = setInterval(async () => {
      if (userData?.uid) {
        await set(ref(rtdb, `users/${userData.uid}/sessions/${deviceInfo.sessionId}/lastActive`), Date.now());
      }
    }, 60000);
    
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
    });
    
    return () => clearInterval(interval);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Clean up session
      const currentSessionId = localStorage.getItem('currentSessionId');
      if (currentSessionId && userData?.uid) {
        await remove(ref(rtdb, `users/${userData.uid}/sessions/${currentSessionId}`));
        localStorage.removeItem('currentSessionId');
      }
      
      await signOut(auth);
      navigate('/logout');
      setTimeout(() => {
        onLogout();
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleSaveProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ 
        name, 
        bio, 
        email, 
        phone, 
        location, 
        github, 
        twitter, 
        linkedin 
      });
    }
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`https://devconnect.app/profile/${userData?.uid || userData?.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 text-gray-900">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                Your account settings
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={copyProfileLink}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Add extra padding for mobile to avoid navigation overlaps */}
      <div className={`max-w-4xl mx-auto px-4 py-6 ${isMobile ? 'pt-6 pb-20' : 'py-8'}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Info */}
          <div className="md:col-span-5">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-xl border-white/20 rounded-2xl shadow-md p-7 border"
            >
              <div className="flex justify-end">
                {!isEditing ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm mb-4"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Profile</span>
                  </motion.button>
                ) : (
                  <div className="flex gap-2 mb-4">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-xl hover:shadow-lg transition-all text-sm flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all text-sm flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src={userData.photoURL || userData.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=6366f1&color=ffffff&size=128`} 
                    alt="Profile" 
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-gradient-to-r from-indigo-500 to-purple-500 shadow-xl"
                  />
                  {isEditing && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute bottom-1 right-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xl font-bold text-center border-b-2 border-indigo-500 bg-transparent focus:outline-none px-2 py-1 w-full"
                  />
                ) : (
                  <h2 className="text-xl font-bold mb-1">{userData.displayName || userData.name}</h2>
                )}
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Phone className="w-3 h-3 text-gray-500" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location"
                      className="text-center bg-gray-100 rounded-lg px-3 py-1 text-xs"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">{userData.location || location || 'Location not set'}</span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-purple-500" />
                    <span>DevConnect</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-indigo-500" />
                    <span>{userData.email?.split('@')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1 text-gray-700">
                  About
                </h3>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full h-24 border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none resize-none bg-white"
                    placeholder="Write something about yourself..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {userData.bio || bio || "No bio added yet."}
                  </p>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1 text-gray-700">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                  Links
                </h3>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="GitHub username"
                        className="flex-1 bg-gray-100 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="Twitter handle"
                        className="flex-1 bg-gray-100 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="LinkedIn profile"
                        className="flex-1 bg-gray-100 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {(userData.github || github) && (
                      <a href={`https://github.com/${userData.github || github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:text-indigo-600 transition-colors">
                        <Github className="w-3.5 h-3.5" />
                        <span>@{userData.github || github}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {(userData.twitter || twitter) && (
                      <a href={`https://twitter.com/${userData.twitter || twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:text-blue-400 transition-colors">
                        <Twitter className="w-3.5 h-3.5" />
                        <span>@{userData.twitter || twitter}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {(userData.linkedin || linkedin) && (
                      <a href={userData.linkedin || linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:text-blue-600 transition-colors">
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Account Settings */}
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-xl border-white/20 rounded-2xl shadow-md p-7 border"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" />
                  Account Settings
                </h3>
                
                {!isEditing ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Settings</span>
                  </motion.button>
                ) : null}
              </div>
              
              <div className="space-y-5">
                {/* Contact Information */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Contact Information</h4>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium">Email</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                          placeholder="Email address"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">{userData.email}</span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium">Phone</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                          placeholder="Phone number"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">{userData.phone || phone || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Privacy Settings</h4>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Profile visibility</span>
                      </div>
                      <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-lg text-xs">
                        Public
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Email notifications</span>
                      </div>
                      <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs">
                        Enabled
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="p-4 bg-red-50 rounded-xl">
                  <h4 className="text-sm font-semibold mb-3 text-red-600">Account Actions</h4>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;