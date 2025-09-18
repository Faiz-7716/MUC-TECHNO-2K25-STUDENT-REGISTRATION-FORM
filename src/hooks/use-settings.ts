"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AppSettings {
  isFeeEnabled: boolean;
}

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'config';

export default function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as AppSettings);
        } else {
          // If no settings doc exists, create it with a default value of false.
          const defaultSettings: AppSettings = { isFeeEnabled: false };
          setDoc(docRef, defaultSettings)
            .then(() => {
                setSettings(defaultSettings);
                console.log("Default settings created and applied.");
            })
            .catch(err => {
                 console.error("Error creating default settings: ", err);
                 setError('Failed to initialize settings.');
            });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching settings: ", err);
        setError('Failed to fetch settings.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await setDoc(docRef, newSettings, { merge: true });
    } catch (e) {
      console.error("Error updating settings: ", e);
      throw new Error("Failed to update settings.");
    }
  }, []);

  return { settings, loading, error, updateSettings };
}
