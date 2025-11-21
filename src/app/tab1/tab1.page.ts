import { Component } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular'; // <--- PŘIDAT ActionSheetController
import { AddMovieModalComponent } from '../add-movie-modal/add-movie-modal.component';
import { Movie } from '../interface/movie.interface';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false 
})
export class Tab1Page {

  movies: Movie[] = [];

  // <--- PŘIDAT actionSheetCtrl DO CONSTRUCTORU
  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController 
  ) {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddMovieModalComponent,
      cssClass: 'add-movie-modal-css'
    });

    modal.onWillDismiss().then((data) => {
      if (data.role === 'confirm') {
        const newMovie: Movie = {
          id: Math.random().toString(),
          ...data.data
        };
        this.movies.push(newMovie);
      }
    });

    return await modal.present();
  }

  // <--- NOVÁ FUNKCE: Otevře menu s možnostmi
  async openOptions(movie: Movie) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: movie.title, // Nadpis menu bude název filmu
      buttons: [
        {
          text: 'Delete',
          role: 'destructive', // Červená barva (v iOS stylu)
          icon: 'trash',
          handler: () => {
            this.deleteMovie(movie); // Zavolá smazání
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // Nic se nestane, jen se zavře
          }
        }
      ]
    });
    await actionSheet.present();
  }

  // <--- NOVÁ FUNKCE: Smaže film z pole
  deleteMovie(movie: Movie) {
    // Vyfiltrujeme pole tak, že si necháme všechno KROMĚ toho filmu, co chceme smazat
    this.movies = this.movies.filter(m => m.id !== movie.id);
  }
}