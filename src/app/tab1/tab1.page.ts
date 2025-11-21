import { Component, OnInit } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { AddMovieModalComponent } from '../add-movie-modal/add-movie-modal.component';
import { Movie } from '../interface/movie.interface';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {

  movies: Movie[] = [];          // Všechna data
  filteredMovies: Movie[] = [];  // Data zobrazená na obrazovce (po hledání)
  
  currentView: string = 'collection';

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  ngOnInit() {
    const storedData = localStorage.getItem('my_movies');
    if (storedData) {
      this.movies = JSON.parse(storedData);
      // Na začátku zobrazíme všechno
      this.filteredMovies = [...this.movies];
    }
  }

  // --- NOVÁ FUNKCE: Hledání ---
  searchMovies(event: any) {
    const query = event.target.value.toLowerCase();
    
    if (!query || query === '') {
      // Když je hledání prázdné, zobrazíme vše
      this.filteredMovies = [...this.movies];
    } else {
      // Jinak filtrujeme podle názvu
      this.filteredMovies = this.movies.filter(m => 
        m.title.toLowerCase().includes(query)
      );
    }
  }

  saveMovies() {
    localStorage.setItem('my_movies', JSON.stringify(this.movies));
    // Po uložení musíme aktualizovat i zobrazený seznam (pokud zrovna nehledáme)
    // Pro jednoduchost resetujeme filtr, aby se zobrazil nový film
    this.filteredMovies = [...this.movies];
  }

  getAverageRating(): number {
    if (this.movies.length === 0) return 0;
    const total = this.movies.reduce((sum, movie) => sum + movie.rating, 0);
    return parseFloat((total / this.movies.length).toFixed(1));
  }

  async openAddModal(movieToEdit?: Movie) {
    const modal = await this.modalCtrl.create({
      component: AddMovieModalComponent,
      cssClass: 'add-movie-modal-css',
      componentProps: { movieData: movieToEdit }
    });

    modal.onWillDismiss().then((data) => {
      if (data.role === 'confirm') {
        const resultData = data.data;
        const index = this.movies.findIndex(m => m.id === resultData.id);

        if (index > -1) {
          this.movies[index] = resultData;
        } else {
          const newMovie: Movie = {
            id: Math.random().toString(),
            ...resultData
          };
          this.movies.push(newMovie);
        }
        this.saveMovies();
      }
    });

    return await modal.present();
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

  deleteMovie(movie: Movie) {
    this.movies = this.movies.filter(m => m.id !== movie.id);
    this.saveMovies();
  }
}