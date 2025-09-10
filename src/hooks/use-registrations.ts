"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Registration, RegistrationData } from '@/lib/types';

export default function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'registrations_2k25'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const regs: Registration[] = [];
        querySnapshot.forEach((doc) => {
          regs.push({ id: doc.id, ...doc.data() } as Registration);
        });
        setRegistrations(regs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching registrations: ", err);
        setError('Failed to fetch data. Please check your Firebase connection and permissions.');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  const addRegistration = useCallback(async (data: RegistrationData) => {
    try {
      await addDoc(collection(db, "registrations_2k25"), {
        ...data,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      throw new Error("Failed to add registration.");
    }
  }, []);

  const deleteRegistration = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "registrations_2k25", id));
    } catch (e) {
      console.error("Error deleting document: ", e);
      throw new Error("Failed to delete registration.");
    }
  }, []);


  return { registrations, loading, error, addRegistration, deleteRegistration };
}
