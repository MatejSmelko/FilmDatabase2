import { Component, OnInit } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page{

  authMode: string = 'login'; // Přepínač v HTML
  isLogin: boolean = true;    // Pomocná pro texty

  email = '';
  password = '';
  userEmail: string | null = null; // Tady bude email přihlášeného uživatele

  constructor(
    private auth: Auth, // Injectujeme Firebase Auth
    private toastCtrl: ToastController
  ) {
    // Sledujeme, jestli je uživatel přihlášen
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userEmail = user.email;
      } else {
        this.userEmail = null;
      }
    });
  }
  
  toggleMode() {
    this.isLogin = this.authMode === 'login';
  }

  async submit() {
    if (!this.email || !this.password) {
      this.showToast('Please enter email and password', 'warning');
      return;
    }

    try {
      if (this.isLogin) {
        // PŘIHLÁŠENÍ
        await signInWithEmailAndPassword(this.auth, this.email, this.password);
        this.showToast('Welcome back!', 'success');
      } else {
        // REGISTRACE
        await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        this.showToast('Account created successfully!', 'success');
      }
    } catch (e: any) {
      // Chyba (např. špatné heslo, email už existuje)
      console.error(e);
      this.showToast(e.message, 'danger');
    }
  }

  async logout() {
    await signOut(this.auth);
    this.showToast('Logged out', 'medium');
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}