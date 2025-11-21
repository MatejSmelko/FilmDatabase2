import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
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

  constructor(private modalCtrl: ModalController) {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddMovieModalComponent,
      cssClass: 'add-movie-modal-css'
    });

    modal.onWillDismiss().then((data) => {
      if (data.role === 'confirm') {
        const newMovie: Movie = { id: Math.random().toString(), ...data.data };
        this.movies.push(newMovie);
      }
    });
    return await modal.present();
  }
}