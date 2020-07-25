import { Component, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { auth } from "firebase";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public latitude: any;
  public longitude: any;
  public db: any;
  constructor(
    private geolocation: Geolocation,
    public zone: NgZone,
    private googlePlus: GooglePlus,
    public afAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    public router: Router,
    public toastController: ToastController
  ) {
    this.currentLocation();
  }
  async currentLocation() {
    await this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp);
      console.log(resp.coords.latitude, resp.coords.longitude);
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      console.log('latitude & longitude', this.latitude, this.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
  async googleAuthentication() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.storeUserData(credential.user);
  }
  async storeUserData(user) {
    let params = {
      email: user.email,
      fullName: user.displayName,
      uid: user.uid,
      imageUrl: user.photoURL,
      latitude: this.latitude,
      longitude: this.longitude
    };
    this.angularFirestore
        .collection('users')
        .add(params)
        .then(async (data) => {
              localStorage.setItem('userID', data.id);
              const toast = await this.toastController.create({
                message: 'Login successful',
                duration: 2000,
                position: 'top',
                cssClass: 'success-message',
              });
              await toast.present();
              this.router.navigate(['/todo']);
        })
        .catch((e) => console.warn('error of add data:', e));
  }
}
