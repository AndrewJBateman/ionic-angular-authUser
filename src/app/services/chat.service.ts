import { Injectable } from "@angular/core";
// import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import firebase from "firebase/compat/app";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export interface User {
  uid: string;
  email: string;
}

export interface Message {
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  currentUser: User = {uid: "testUser", email: "testEmail"};

  constructor(private auth: Auth, private afs: AngularFirestore) {
    this.auth.onAuthStateChanged((user) => {
      if (user && user !== null) {
        console.log("Changed: ", user);
        this.currentUser = user;
      }
      else {
        console.log("user is null")
      }

    });
  }

  async signUp(email: string, password: string): Promise<any> {
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth,
        email, password
      );
      const uid = credential.user?.uid;
      const returnDoc = this.afs.doc(`users/${uid}`).set({
        uid,
        email: credential.user.email,
      });
      console.log("returnDoc type: ", typeof(returnDoc));
      return returnDoc;
    } catch (error) {
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (e) {
      return null;
    }
  }

  signOut(): Promise<any> {
    return signOut(this.auth);
  }

  addChatMessage(msg: string): Promise<any> {
		const msgList = this.afs.collection("messages").add({
      msg,
      from: this.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
		console.log("msgList: ", msgList);
		return msgList;
  }

  getChatMessages(): Observable<Message[]> {
    let users: User[] = [];
    return this.getUsers().pipe(
      switchMap((res) => {
        users = res;
        console.log("all users: ", users);
        return this.afs
          .collection("messages", (ref) => ref.orderBy("createdAt"))
          .valueChanges({ idField: "id" }) as Observable<Message[]>;
      }),
      map((messages) => {
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.uid === m.from;
        }
				console.log("messages: ", messages);
        return messages;
      })
    );
  }

  getUsers(): Observable<User[]> {
    return this.afs
      .collection("users")
      .valueChanges({ idField: "uid" }) as Observable<User[]>;
  }

  getUserForMsg(msgFromId: string, users: User[]): string | undefined {
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email;
      } 
        return "Deleted";
    }
  }
}
