import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor() {}

  public static getFirebaseConfig() {
    const app = initializeApp(environment.firebaseConfig);
    return getFirestore(app);
  }
}
