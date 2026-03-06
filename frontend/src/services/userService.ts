import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  updateProfile, 
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, auth, storage } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  phone: string;
  avatar?: string;
  accountType: 'client' | 'provider';
  businessName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  username?: string;
  phone?: string;
  avatar?: string;
  businessName?: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        uid: userDoc.id,
        ...userDoc.data()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string, 
  data: UpdateProfileData
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });
    
    if (Object.keys(cleanData).length > 0) {
      await updateDoc(userRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
      });
    }
    
    if (data.username && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: data.username
      });
    }
    
    if (data.avatar && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        photoURL: data.avatar
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadAvatar = async (
  userId: string, 
  file: File
): Promise<string> => {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('Plik musi być obrazem');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Plik jest za duży (max 5MB)');
    }
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatars/${userId}_${Date.now()}.${fileExtension}`;
    
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    await updateUserProfile(userId, { avatar: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export const changePassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Brak zalogowanego użytkownika');
    }
    
    if (newPassword.length < 8) {
      throw new Error('Hasło musi mieć co najmniej 8 znaków');
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error('Hasło musi zawierać wielką literę');
    }
    if (!/[a-z]/.test(newPassword)) {
      throw new Error('Hasło musi zawierać małą literę');
    }
    if (!/[0-9]/.test(newPassword)) {
      throw new Error('Hasło musi zawierać cyfrę');
    }
    
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Error changing password:', error);
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('Nieprawidłowe obecne hasło');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Nowe hasło jest za słabe');
    }
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Zaloguj się ponownie i spróbuj jeszcze raz');
    }
    
    throw error;
  }
};

export const deleteUserAccount = async (password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Brak zalogowanego użytkownika');
    }
    
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    try {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile?.avatar && userProfile.avatar.includes('firebase')) {
        const avatarRef = ref(storage, userProfile.avatar);
        await deleteObject(avatarRef);
      }
    } catch (e) {
      console.log('Avatar deletion skipped');
    }
    
    await deleteDoc(doc(db, 'users', user.uid));
    
    await deleteUser(user);
  } catch (error: any) {
    console.error('Error deleting account:', error);
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('Nieprawidłowe hasło');
    }
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Zaloguj się ponownie i spróbuj jeszcze raz');
    }
    
    throw error;
  }
};