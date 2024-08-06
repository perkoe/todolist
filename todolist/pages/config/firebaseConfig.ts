import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseKeys';


const app = initializeApp(firebaseConfig);

export { app };
