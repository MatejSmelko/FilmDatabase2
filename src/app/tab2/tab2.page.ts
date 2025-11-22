import { Component, OnInit } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page implements OnInit {

  authMode: string = 'login';
  isLogin: boolean = true;
  email = '';
  password = '';
  userEmail: string | null = null;

  constructor(
    private auth: Auth,
    private toastCtrl: ToastController
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userEmail = user.email;
      } else {
        this.userEmail = null;
      }
    });
  }

  ngOnInit() {
  }

  toggleMode() {
    this.isLogin = this.authMode === 'login';
  }

  async submit() {
    // Základní kontrola, jestli je něco vyplněno
    if (!this.email || !this.password) {
      this.showToast('Zadejte prosím email a heslo.', 'warning');
      return;
    }

    // Pokud je to registrace, kontrolujeme i Username (pokud ho používáš)
    // if (!this.isLogin && !this.username) { ... } // (Odkomentuj, pokud jsi nechal username)

    try {
      if (this.isLogin) {
        // --- PŘIHLÁŠENÍ ---
        await signInWithEmailAndPassword(this.auth, this.email, this.password);
        this.showToast('Vítejte zpět!', 'success');
      } else {
        // --- REGISTRACE ---
        const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        
        // (Zde případně kód pro updateProfile, pokud ho používáš)
        
        this.showToast('Účet byl úspěšně vytvořen!', 'success');
      }
    } catch (e: any) {
      console.error('Chyba přihlášení:', e); // Vypíše chybu do konzole pro tebe

      let message = 'Nastala neznámá chyba.'; // Výchozí hláška

      // PŘEKLAD CHYBOVÝCH KÓDŮ Z FIREBASE
      switch (e.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = 'Nesprávný email nebo heslo.';
          break;
        case 'auth/email-already-in-use':
          message = 'Tento email už je zaregistrovaný.';
          break;
        case 'auth/invalid-email':
          message = 'Zadaný email nemá správný formát.';
          break;
        case 'auth/weak-password':
          message = 'Heslo je příliš slabé (musí mít min. 6 znaků).';
          break;
        case 'auth/network-request-failed':
          message = 'Zkontrolujte připojení k internetu.';
          break;
        case 'auth/too-many-requests':
          message = 'Příliš mnoho pokusů. Zkuste to chvíli později.';
          break;
      }

      // Zobrazíme českou hlášku červeně
      this.showToast(message, 'danger');
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 2000, color: color, position: 'top'
    });
    toast.present();
  }
}