import React, { useState, useCallback } from "react";
import { db, setDoc, doc } from "../../lib/firebase.js";
import { motion } from "framer-motion";
import { Upload, Camera, Loader2, UserCircle2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useNavigate } from 'react-router-dom';
import { uploadToImgBB } from "../../utils/imageUpload";

const RegisterPage = ({ user, onCompleteRegistration }) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const navigate = useNavigate();



  const createFinalImage = useCallback(async (croppedAreaPixels) => {
    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = previewUrl;
    
    await new Promise(resolve => {
      image.onload = resolve;
    });

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob((blob) => {
      setProfilePic(new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
      setShowCropper(false);
    }, 'image/jpeg', 0.95);
  }, [previewUrl, setProfilePic, setShowCropper]);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    createFinalImage(croppedAreaPixels);
  }, [createFinalImage]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    try {
      if (!profilePic) {
        throw new Error('Please upload a profile picture');
      }
  
      setIsUploading(true);
      let profilePicUrl;
      
      try {
        profilePicUrl = await uploadToImgBB(profilePic);
      } catch (uploadError) {
        throw new Error('Failed to upload profile picture. Please try again.');
      }
  
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name,
        bio,
        profilePic: profilePicUrl,
        email: user.email,
        createdAt: new Date(),
        lastSeen: new Date(),
        online: true
      });
      
      onCompleteRegistration();
      navigate('/chat');
    } catch (error) {
      console.error('Error during registration:', error);
      alert(error.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 mt-2">Let's get to know you better</p>
        </motion.div>

        {showCropper ? (
          <div className="relative h-64 mb-6">
            <Cropper
              image={previewUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              className="rounded-xl overflow-hidden"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              {profilePic ? (
                <img
                  src={URL.createObjectURL(profilePic)}
                  alt="Profile Preview"
                  className="w-full h-full rounded-full object-cover shadow-lg ring-4 ring-purple-100"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <UserCircle2 className="w-16 h-16 text-purple-300" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full shadow-lg cursor-pointer hover:bg-purple-700 transition-colors">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUploading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            />
          </div>

          <div>
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isUploading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none h-32"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegister}
            disabled={isUploading || !name || !profilePic}
            className={`w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2
              ${isUploading || !name || !profilePic 
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-200 transition-all'
              }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Complete Registration</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;