import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Movie } from '../interface/movie.interface';

@Component({
  selector: 'app-add-movie-modal',
  templateUrl: './add-movie-modal.component.html',
  styleUrls: ['./add-movie-modal.component.scss'],
  standalone: true, 
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AddMovieModalComponent {
  movie: Partial<Movie> = {
    rating: 3
  };

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  saveMovie() {
    if (this.movie.title) {
      this.modalCtrl.dismiss(this.movie, 'confirm');
    }
  }
}