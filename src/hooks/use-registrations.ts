"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Registration } from '@/lib/types';

export default function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  return { registrations, loading, error };
}
