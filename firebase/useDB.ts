import { Firestore, doc } from 'firebase/firestore';

interface SettingsData {
  updatedAt: string;
}

const fetchSettingsData = (db: Firestore) => {
  const { data: settingsData, promise: settingsLoaded } =
    useDocument<SettingsData>(
      doc(db, 'season', '2022-2023', 'settings', 'players')
    );

  return { settingsData, settingsLoaded };
};

const fetchPlayerData = (db: Firestore) => {
  const { data: settingsData, promise: settingsLoaded } =
    useDocument<SettingsData>(
      doc(db, 'season', '2022-2023', 'settings', 'players')
    );

  return { settingsData, settingsLoaded };
};

export { fetchSettingsData };
