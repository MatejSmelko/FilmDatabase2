import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, ActionSheetController, IonContent } from '@ionic/angular';
import { AddMovieModalComponent } from '../add-movie-modal/add-movie-modal.component';
import { Movie } from '../interface/movie.interface';

// Importy pro Firebase (Databáze + Auth)
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, query } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {

  @ViewChild(IonContent) content!: IonContent;
  // --- PROMĚNNÉ PRO FILMY ---
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  userId: string | null = null;
  userEmail: string | null = null;
  movieSubscription: Subscription | null = null;

  // --- PROMĚNNÉ PRO ZOBRAZENÍ A AUTH ---
  currentView: string = 'collection';
  
  // Data formulářů
  email = '';
  password = '';
  username = '';

  // Chybové hlášky
  statusMessage: string | null = null;
  statusColor: string = 'danger';

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private firestore: Firestore,
    public auth: Auth 
  ) {}

  ngOnInit() {
    // Sledujeme, jestli je uživatel přihlášen
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // PŘIHLÁŠEN
        this.userId = user.uid;
        this.userEmail = user.email;
        this.currentView = 'collection'; 
        this.loadMoviesFromFirebase();
      } else {
        // ODHLÁŠEN
        this.userId = null;
        this.userEmail = null;
        this.movies = [];
        this.filteredMovies = [];
        this.currentView = 'login'; 
        if (this.movieSubscription) {
          this.movieSubscription.unsubscribe();
        }
      }
    });
  }

    scrollToTop() {
    this.content.scrollToTop(500);
  }
  // ==========================================
  // LOGIKA PŘIHLÁŠENÍ A REGISTRACE
  // ==========================================

  async submitAuth(type: 'login' | 'register') {
    this.statusMessage = null;

    if (!this.email || !this.password) {
      this.showStatus('Zadejte prosím email a heslo.', 'warning');
      return;
    }

    try {
      if (type === 'login') {
        // Přihlášení
        await signInWithEmailAndPassword(this.auth, this.email, this.password);
        this.showStatus('Vítejte zpět!', 'success');
      } else {
        // Registrace
        const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        
        // Pokud zadal jméno, uložíme ho
        if (this.username && userCredential.user) {
          await updateProfile(userCredential.user, { displayName: this.username });
        }
        this.showStatus('Účet byl úspěšně vytvořen!', 'success');
      }
    } catch (e: any) {
      this.handleAuthError(e);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.showStatus('Odhlášeno.', 'success');
  }

  // Překlad chyb z Firebase do češtiny
  handleAuthError(e: any) {
    let msg = 'Nastala neznámá chyba.';
    switch (e.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        msg = 'Nesprávný email nebo heslo.';
        break;
      case 'auth/email-already-in-use':
        msg = 'Tento email už je zaregistrovaný.';
        break;
      case 'auth/weak-password':
        msg = 'Heslo je příliš slabé (min. 6 znaků).';
        break;
      case 'auth/invalid-email':
        msg = 'Zadaný email nemá správný formát.';
        break;
      case 'auth/network-request-failed':
        msg = 'Zkontrolujte připojení k internetu.';
        break;
      case 'auth/too-many-requests':
        msg = 'Příliš mnoho pokusů. Zkuste to později.';
        break;
    }
    this.showStatus(msg, 'danger');
  }

  // Pomocná funkce pro zobrazení hlášky pod tlačítkem
  showStatus(msg: string, color: string) {
    this.statusMessage = msg;
    this.statusColor = color;
    setTimeout(() => {
      this.statusMessage = null;
    }, 3000);
  }


  // ==========================================
  // LOGIKA FILMŮ (FIRESTORE)
  // ==========================================

  loadMoviesFromFirebase() {
    if (!this.userId) return;

    // Načítáme filmy z cesty: users / MOJE_ID / movies
    const q = query(collection(this.firestore, `users/${this.userId}/movies`));
    
    this.movieSubscription = collectionData(q, { idField: 'id' }).subscribe((data) => {
      this.movies = data as Movie[];
      this.filteredMovies = [...this.movies]; // Aktualizace seznamu
    });
  }

  // Otevření modálu pro přidání/editaci
  async openAddModal(movieToEdit?: Movie) {
    const modal = await this.modalCtrl.create({
      component: AddMovieModalComponent,
      cssClass: 'add-movie-modal-css',
      componentProps: { movieData: movieToEdit }
    });

    modal.onWillDismiss().then(async (data) => {
      if (data.role === 'confirm' && this.userId) {
        const res = data.data;

        if (res.id && this.movies.some(m => m.id === res.id)) {
          // Editace existujícího
          const docRef = doc(this.firestore, `users/${this.userId}/movies/${res.id}`);
          await updateDoc(docRef, res);
        } else {
          // Přidání nového (odstraníme případné fake ID)
          const { id, ...cleanMovie } = res;
          const colRef = collection(this.firestore, `users/${this.userId}/movies`);
          await addDoc(colRef, cleanMovie);
        }
      }
    });
    return await modal.present();
  }

  // Menu možností (Edit/Delete)
  async openOptions(movie: Movie) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: movie.title,
      buttons: [
        {
          text: 'Upravit',
          icon: 'create',
          handler: () => this.openAddModal(movie)
        },
        {
          text: 'Smazat',
          role: 'destructive',
          icon: 'trash',
          handler: () => this.deleteMovie(movie)
        },
        {
          text: 'Zrušit',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  // Smazání filmu
  async deleteMovie(movie: Movie) {
    if (!this.userId || !movie.id) return;
    const docRef = doc(this.firestore, `users/${this.userId}/movies/${movie.id}`);
    await deleteDoc(docRef);
  }

  // Vyhledávání
  searchMovies(event: any) {
    const query = event.target.value.toLowerCase();
    if (!query || query === '') {
      this.filteredMovies = [...this.movies];
    } else {
      this.filteredMovies = this.movies.filter(m => 
        m.title.toLowerCase().includes(query)
      );
    }
  }

  // Menu pro řazení
  async openSortMenu() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Třídit kolekci podle',
      buttons: [
        { text: 'Hodnocení (Od nejvyššího)', icon: 'star', handler: () => this.sortMovies('rating') },
        { text: 'Rok (Od nejnovějšího)', icon: 'calendar', handler: () => this.sortMovies('year') },
        { text: 'Název (A-Z)', icon: 'text', handler: () => this.sortMovies('title') },
        { text: 'Zrušit', icon: 'close', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  sortMovies(criteria: string) {
    this.filteredMovies.sort((a, b) => {
      if (criteria === 'rating') return b.rating - a.rating;
      if (criteria === 'year') return (b.year || 0) - (a.year || 0);
      if (criteria === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }
}