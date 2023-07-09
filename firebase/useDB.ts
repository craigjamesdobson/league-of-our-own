import { initializeApp } from 'firebase/app';
import type { CollectionReference, DocumentData } from 'firebase/firestore';
import { collection, getFirestore } from 'firebase/firestore';
import type { RawDraftedTeamData } from '../modules/drafted-teams/interfaces/RawDraftedTeamData';
import type { RawPlayerData } from '../modules/players/interfaces/RawPlayerData';

// Import all your model types

// Init the firebase app
export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyBMjHznJ_pmwBcn-ys1f-1dFVLzAw6hEeo',
  authDomain: 'league-of-our-own-63fa1.firebaseapp.com',
  projectId: 'league-of-our-own-63fa1',
  storageBucket: 'league-of-our-own-63fa1.appspot.com',
  messagingSenderId: '861637204204',
  appId: '1:861637204204:web:229369b4f531434e9aadc9',
  measurementId: 'G-FWYYJ66CWG',
});

const CURRENT_SEASON = '2023-2024';

// Export firestore incase we need to access it directly
export const firestore = getFirestore();

// This is just a helper to add the type to the db responses
const createCollection = <T = DocumentData>(
  collectionName: string,
  documentID: string,
  subCollection: string
) => {
  return collection(
    firestore,
    collectionName,
    documentID,
    subCollection
  ) as CollectionReference<T>;
};

// export all your collections
export const playersCollection = createCollection<RawPlayerData>(
  'season',
  CURRENT_SEASON,
  'players'
);

export const draftedTeamsCollection = createCollection<RawDraftedTeamData>(
  'season',
  CURRENT_SEASON,
  'drafted-teams'
);

export const settingsCollection = createCollection(
  'season',
  CURRENT_SEASON,
  'settings'
);
