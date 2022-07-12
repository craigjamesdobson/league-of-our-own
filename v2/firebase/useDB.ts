// Get the imports
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  CollectionReference,
  collection,
  DocumentData,
} from 'firebase/firestore';

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

// Export firestore incase we need to access it directly
export const firestore = getFirestore();

// This is just a helper to add the type to the db responses
const createCollection = <T = DocumentData>(
  collectionName: string,
  documentID?: string,
  subCollection?: string
) => {
  return collection(
    firestore,
    collectionName,
    documentID,
    subCollection
  ) as CollectionReference<T>;
};

// Import all your model types
import { Player } from '../modules/players/types/Player';

// export all your collections
export const playersCollection = createCollection<Player>(
  'season',
  '2022-2023',
  'players'
);
