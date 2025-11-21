import { Component, Input, OnInit } from '@angular/core'; // Přidán Input a OnInit
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
export class AddMovieModalComponent implements OnInit {
  
  // Pokud sem něco pošleme, uloží se to sem
  @Input() movieData: Movie | null = null;

  // S tímto objektem pracuje formulář
  movie: Partial<Movie> = {
    rating: 3
  };

  isEditing = false; // Pomocná proměnná pro změnu nadpisů

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    // Pokud nám přišla data (editace), naplníme formulář
    if (this.movieData) {
      this.movie = { ...this.movieData }; // Uděláme kopii, ať neměníme originál hned
      this.isEditing = true;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  saveMovie() {
    if (this.movie.title) {
      this.modalCtrl.dismiss(this.movie, 'confirm');
    }
  }
}