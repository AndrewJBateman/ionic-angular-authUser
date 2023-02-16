import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updateCurrentUser,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public afs: AngularFirestore) {}
  userData?: User;

  // Use Firebase signInWithEmailAndPassword method to login to Firebase
  // Store user object {uid, email, password & token} in session storage
  async login(email: string, password: string) {
    FirebaseService.getFirebaseConfig();
    const auth = getAuth();
    const user = await signInWithEmailAndPassword(auth, email, password).then(
      (userData) => {
        const { user } = userData;
        sessionStorage.setItem(
          'user',
          JSON.stringify({
            uid: user.uid,
            token: user['accessToken'],
            email: user.email,
            username: user.displayName,
            password: password,
          })
        );
      }
    );
    return user;
  }

  //Al registrarnos, lo hacemos con el método 'createUserWithEmailAndPassword' de FirebaseAuth, y guardamos el usedata del usuario que hemos creado
  async register(email: string, password: string, displayName: string) {
    FirebaseService.getFirebaseConfig();
    const auth = getAuth();
    const user = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    ).then((result) => this.setUserData(result.user, displayName));
  }

  //Al cerrar sesión, borramos también el user del sessionStorage
  async logoff() {
    FirebaseService.getFirebaseConfig();
    const auth = getAuth();
    auth.signOut().then(() => sessionStorage.removeItem('user'));
  }

  deleteUserData() {
    FirebaseService.getFirebaseConfig();
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      const userRef: AngularFirestoreDocument<any> = this.afs.doc(
        `users/${user?.uid}`
      );
      userRef
        .get()
        .toPromise()
        .then(() => {
          let deleteDoc = this.afs.collection('users').doc(user?.uid);
          deleteDoc.delete();
        });
    } catch (error) {
      console.log('No hay coincidencias en la base de datos');
    }
  }

  setUserData(user: any, displayName: string) {
    updateProfile(user, { displayName: displayName });

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  changePassword(newPass: string) {
    FirebaseService.getFirebaseConfig();
    const auth = getAuth();
    updatePassword(auth.currentUser, newPass);
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        uid: auth.currentUser.uid,
        token: auth.currentUser['accessToken'],
        email: auth.currentUser.email,
        username: auth.currentUser.displayName,
        password: newPass,
      })
    );
  }

  changeUsername(newUser: string, password: string) {
    FirebaseService.getFirebaseConfig();
    const auth = getAuth();
    this.setUserData(auth.currentUser, newUser);
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        uid: auth.currentUser?.uid,
        token: auth.currentUser?['accessToken'],
        email: auth.currentUser?.email,
        username: newUser,
        password: password,
      })
    );
    alert('User name updated successfully');
  }

  async reauth(user: string, password: string) {
    FirebaseService.getFirebaseConfig();
    const auth = getAuth();
    const credential = EmailAuthProvider.credential(user, password);
    let valid = false;

    await reauthenticateWithCredential(auth.currentUser, credential).then(
      () => {
        this.deleteAccount();
        alert('Account deleted successfully');
        valid = true;
      },
      () => {
        alert('The data entered was invalid');
        valid = false;
      }
    );
    return valid;
  }

  async deleteAccount() {
    FirebaseService.getFirebaseConfig();
    const auth = getAuth();
    this.deleteUserData();
    await auth.currentUser?.delete();
  }
}
export interface User {
  uid: string;
  email: string;
  displayName: string;
}
