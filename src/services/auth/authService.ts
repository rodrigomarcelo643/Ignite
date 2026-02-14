import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  department?: string;
  role: 'barangay' | 'citizen';
}

export const registerUser = async (data: RegisterData) => {
  const usersRef = collection(db, 'users');
  
  await addDoc(usersRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

export const loginUser = async (username: string, password: string) => {
  const usersRef = collection(db, 'users');
  
  // For citizens, username is the contact number (without +63)
  // Check if username is a phone number (11 digits)
  const isPhoneNumber = /^\d{10}$/.test(username);
  
  let q;
  if (isPhoneNumber) {
    // Query by contactNumber for citizen login
    q = query(usersRef, where('contactNumber', '==', username), where('password', '==', password));
  } else {
    // Query by username for barangay login
    q = query(usersRef, where('username', '==', username), where('password', '==', password));
  }
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('Invalid credentials');
  }
  
  const userData = querySnapshot.docs[0].data();
  return {
    id: querySnapshot.docs[0].id,
    username: userData.username || userData.contactNumber,
    role: userData.role || 'citizen',
  };
};
