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

  movies: Movie[] = [];
  currentView: string = 'collection';

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  ngOnInit() {
    const storedData = localStorage.getItem('my_movies');
    if (storedData) {
      this.movies = JSON.parse(storedData);
    }
  }

  saveMovies() {
    localStorage.setItem('my_movies', JSON.stringify(this.movies));
  }

  getAverageRating(): number {
    if (this.movies.length === 0) return 0;
    const total = this.movies.reduce((sum, movie) => sum + movie.rating, 0);
    return parseFloat((total / this.movies.length).toFixed(1));
  }

  // TATO FUNKCE JE ZMĚNĚNÁ: Nyní přijímá volitelný parametr 'movieToEdit'
  async openAddModal(movieToEdit?: Movie) {
    const modal = await this.modalCtrl.create({
      component: AddMovieModalComponent,
      cssClass: 'add-movie-modal-css',
      // Zde posíláme data do modálu (pokud existují)
      componentProps: { 
        movieData: movieToEdit 
      }
    });

    modal.onWillDismiss().then((data) => {
      if (data.role === 'confirm') {
        const resultData = data.data;

        // LOGIKA: Pokud má film ID a to ID už máme v seznamu, jde o EDITACI
        const index = this.movies.findIndex(m => m.id === resultData.id);

        if (index > -1) {
          // EDITACE: Nahradíme starý záznam novým
          this.movies[index] = resultData;
        } else {
          // NOVÝ FILM: Přidáme ID a vložíme do pole
          const newMovie: Movie = {
            id: Math.random().toString(), // ID generujeme jen u nových
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
        // TLAČÍTKO PRO EDITACI
        {
          text: 'Edit',
          icon: 'create',
          handler: () => {
            this.openAddModal(movie); // Otevřeme modál a pošleme mu tento film
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deleteMovie(movie);
          }
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