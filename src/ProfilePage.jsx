import { useState, useEffect } from "react"; 
import { useNavigate } from 'react-router-dom'; 
import { useUser } from './authContext/UserContext';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { db } from "./firebase/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import "./ProfilePage.css"; // Assuming you will create this CSS file

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userEmail } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userNationality, setUserNationality] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    if (userEmail) {
      const userProfileRef = doc(db, 'UserProfile', userEmail);
      const unsubscribe = onSnapshot(userProfileRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setDisplayName(userData.DisplayName || userEmail);
          setUserAge(userData.Age || '');
          setUserNationality(userData.Nationality || '');
          setProfilePicUrl(userData.ProfilePicture || '');
        }
      }, (error) => {
        console.error("Error fetching user profile: ", error);
      });
      return () => unsubscribe();
    }
  }, [userEmail]);

  const handleProfilePictureUpload = () => {
    if (!profilePic) return;

    const storageRef = ref(getStorage(), `profile_pictures/${userEmail}`);
    uploadBytes(storageRef, profilePic).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        setProfilePicUrl(downloadURL);
        updateUserProfile(downloadURL);
      });
    }).catch((error) => {
      console.error("Error uploading profile picture: ", error);
    });
  };

  const handleProfilePopupSubmit = (e) => {
    e.preventDefault();
    if (profilePic) {
      handleProfilePictureUpload();
    } else {
      updateUserProfile(profilePicUrl);
    }
  };

  const updateUserProfile = (newProfilePicUrl) => {
    const userProfileRef = doc(db, 'UserProfile', userEmail);
    const updatedProfile = {
      DisplayName: newDisplayName || displayName,
      Age: userAge,
      Nationality: userNationality,
      ProfilePicture: newProfilePicUrl
    };

    setDoc(userProfileRef, updatedProfile, { merge: true })
      .then(() => {
        setShowProfilePopup(false);
        setProfilePic(null);
      })
      .catch((error) => {
        console.error("Error updating user profile: ", error);
      });
  };

  const handleSignOut = () => {
    navigate('/dashboard');
  };

  return (
    <div className="profile-page-container">
      <div className="profile-content">
        <div className="profile-details">
          {profilePicUrl ? (
            <img src={profilePicUrl} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-pic default-pic"></div>
          )}
          <p>Welcome back, {displayName}</p>
          <p>Age: {userAge}</p>
          <p>Nationality: {userNationality}</p>
          <button onClick={() => setShowProfilePopup(true)} className="edit-profile-btn" >Edit Profile Details</button>
          <button onClick={handleSignOut} className="sign-out-btn">Return</button>
        </div>

        {showProfilePopup && (
          <div className="overlay">
            <div className="modal">
              <form onSubmit={handleProfilePopupSubmit} className="profile-edit-form">
                <label htmlFor="displayName"className="label-black">Display Name:</label>
                <input
                  type="text"
                  id="displayName"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Enter new display name"
                />
                <label htmlFor="profilePic"className="label-black">Profile Picture:</label>
                <input className="label-black"
                  type="file"
                  id="profilePic"
                  onChange={(e) => setProfilePic(e.target.files[0])}
                />
                <label htmlFor="userAge"className="label-black">Age:</label>
                <input
                  type="number"
                  id="userAge"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                  placeholder="Enter your age"
                />
                <label htmlFor="userNationality"className="label-black">Nationality:</label>
                <input
                  type="text"
                  id="userNationality"
                  value={userNationality}
                  onChange={(e) => setUserNationality(e.target.value)}
                  placeholder="Enter your nationality"
                />
                <div className="form-buttons">
                  <button type="submit" className="label-white">Save</button>
                  <button type="button" onClick={() => setShowProfilePopup(false)} className="label-white">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
