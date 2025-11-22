import { Component, OnInit } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AddMovieModalComponent } from '../add-movie-modal/add-movie-modal.component';
import { Movie } from '../interface/movie.interface';

// --- FIREBASE IMPORTY ---
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {

  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  currentView: string = 'collection';
  
  userId: string | null = null;       // ID přihlášeného uživatele
  movieSubscription: Subscription | null = null; // Hlídač databáze
  userEmail: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private firestore: Firestore, // Databáze
    private auth: Auth,           // Přihlašování
    private router: Router
  ) {}

ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId = user.uid;
        this.userEmail = user.email; // 👈 ULOŽÍME EMAIL
        this.loadMoviesFromFirebase();
      } else {
        this.userId = null;
        this.userEmail = null; // 👈 VYMAŽEME EMAIL
        this.movies = [];
        this.filteredMovies = [];
        if (this.movieSubscription) {
          this.movieSubscription.unsubscribe();
        }
      }
    });
  }

  // --- NAČÍTÁNÍ DAT Z FIREBASE ---
  loadMoviesFromFirebase() {
    if (!this.userId) return;

    // Cesta: users -> (moje ID) -> movies
    const moviesRef = collection(this.firestore, `users/${this.userId}/movies`);
    
    // Chceme data, včetně jejich ID
    // (Můžeme přidat orderBy('title') pro základní řazení)
    const q = query(moviesRef); 

    // Tohle je "živý proud" dat. Kdykoliv se v databázi něco změní, tohle se spustí.
    this.movieSubscription = collectionData(q, { idField: 'id' }).subscribe((data) => {
      this.movies = data as Movie[];
      this.filteredMovies = [...this.movies]; // Aktualizujeme i zobrazený seznam
    });
  }
  async openGuestMenu() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'You are currently a Guest',
      subHeader: 'Sign in to sync your movies across devices.',
      buttons: [
        {
          text: 'Log In / Register',
          icon: 'log-in-outline',
          handler: () => {
            // 🚀 TOTO PŘEPNE NA TAB 2
            this.router.navigate(['/tabs/tab2']);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
  // --- PŘIDÁNÍ / EDITACE ---
  async openAddModal(movieToEdit?: Movie) {
    const modal = await this.modalCtrl.create({
      component: AddMovieModalComponent,
      cssClass: 'add-movie-modal-css',
      componentProps: { movieData: movieToEdit }
    });

    modal.onWillDismiss().then(async (data) => {
      if (data.role === 'confirm' && this.userId) {
        const resultData = data.data;

        if (resultData.id && this.movies.some(m => m.id === resultData.id)) {
          // ✏️ EDITACE (Update)
          // Odkaz na konkrétní dokument v databázi
          const movieDocRef = doc(this.firestore, `users/${this.userId}/movies/${resultData.id}`);
          await updateDoc(movieDocRef, resultData);
        } else {
          // ➕ NOVÝ FILM (Create)
          // Smažeme ID (pokud nějaké přišlo), Firestore si vygeneruje vlastní
          const { id, ...movieWithoutId } = resultData; 
          const moviesRef = collection(this.firestore, `users/${this.userId}/movies`);
          await addDoc(moviesRef, movieWithoutId);
        }
      }
    });

    return await modal.present();
  }

  // --- MAZÁNÍ ---
  async deleteMovie(movie: Movie) {
    if (!this.userId || !movie.id) return;

    const movieDocRef = doc(this.firestore, `users/${this.userId}/movies/${movie.id}`);
    await deleteDoc(movieDocRef);
  }

  // --- HLEDÁNÍ (Zůstává stejné, jen filtruje stažené pole) ---
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

  getAverageRating(): number {
    if (this.movies.length === 0) return 0;
    const total = this.movies.reduce((sum, movie) => sum + movie.rating, 0);
    return parseFloat((total / this.movies.length).toFixed(1));
  }

  async openOptions(movie: Movie) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: movie.title,
      buttons: [
        {
          text: 'Edit',
          icon: 'create',
          handler: () => { this.openAddModal(movie); }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => { this.deleteMovie(movie); }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });
    await actionSheet.present();
  }

  // --- ŘAZENÍ (Zůstává) ---
  async openSortMenu() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Sort Collection By',
      buttons: [
        { text: 'Rating (Highest First)', icon: 'star', handler: () => this.sortMovies('rating') },
        { text: 'Year (Newest First)', icon: 'calendar', handler: () => this.sortMovies('year') },
        { text: 'Title (A-Z)', icon: 'text', handler: () => this.sortMovies('title') },
        { text: 'Cancel', icon: 'close', role: 'cancel' }
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