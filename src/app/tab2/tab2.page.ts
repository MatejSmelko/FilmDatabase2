import { Component, OnInit } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';

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

  // NOVÉ: Proměnné pro zprávu pod tlačítkem
  statusMessage: string | null = null;
  statusColor: string = 'danger'; // 'danger' (červená) nebo 'success' (zelená)

  constructor(
    private auth: Auth
    // ToastController už nepotřebujeme
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
    this.statusMessage = null; // Vyčistit zprávu při přepnutí
  }

  async submit() {
    // Vyčistit předchozí zprávy
    this.statusMessage = null;

    if (!this.email || !this.password) {
      this.showStatus('Zadejte prosím email a heslo.', 'warning');
      return;
    }

    try {
      if (this.isLogin) {
        // --- PŘIHLÁŠENÍ ---
        await signInWithEmailAndPassword(this.auth, this.email, this.password);
        this.showStatus('Vítejte zpět!', 'success');
      } else {
        // --- REGISTRACE ---
        await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        this.showStatus('Účet byl úspěšně vytvořen!', 'success');
      }
    } catch (e: any) {
      console.error('Chyba přihlášení:', e);

      let message = 'Nastala neznámá chyba.';

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
          message = 'Heslo je příliš slabé (min. 6 znaků).';
          break;
        case 'auth/network-request-failed':
          message = 'Zkontrolujte připojení k internetu.';
          break;
        case 'auth/too-many-requests':
          message = 'Příliš mnoho pokusů. Zkuste to později.';
          break;
      }

      this.showStatus(message, 'danger');
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  // NOVÁ FUNKCE: Místo Toastu nastaví proměnnou
  showStatus(msg: string, color: string) {
    this.statusMessage = msg;
    this.statusColor = color;

    // Zpráva zmizí sama po 3 sekundách
    setTimeout(() => {
      this.statusMessage = null;
    }, 3000);
  }
}