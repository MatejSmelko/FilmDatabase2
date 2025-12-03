import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Movie } from '../interface/movie.interface'; 

@Component({
  selector: 'app-add-movie-modal',
  templateUrl: './add-movie-modal.component.html',
  styleUrls: ['./add-movie-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AddMovieModalComponent implements OnInit {
  
  @Input() movieData: Movie | null = null;

  movie: Partial<Movie> = {
    rating: 3
  };

  isEditing = false;

  // Seznam žánrů
  allGenres: string[] = [
    'Akční', 'Dobrodružný', 'Animovaný', 'Biografický', 'Komedie', 
    'Krimi', 'Dokumentární', 'Drama', 'Rodinný', 'Fantasy', 
    'Historický', 'Horror', 'Hudební', 'Muzikálový', 'Mysteriozní', 
    'Romantický', 'Sci-Fi', 'Sportovní', 'Thriller', 'Válečný', 'Western'
  ];

  filteredGenres: string[] = [];
  showSuggestions = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController 
  ) {}

  ngOnInit() {
    if (this.movieData) {
      this.movie = { ...this.movieData };
      this.isEditing = true;
    }
  }

  // Nahrání obrázku
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.showToast('Obrázek je moc velký! (Max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.movie.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Našeptávač žánrů
  onGenreInput(event: any) {
    const query = event.target.value;
    if (!query || query.trim() === '') {
      this.showSuggestions = false;
      return;
    }
    this.filteredGenres = this.allGenres.filter(g => 
      g.toLowerCase().startsWith(query.toLowerCase())
    );
    this.showSuggestions = this.filteredGenres.length > 0;
  }

  selectGenre(genre: string) {
    this.movie.genre = genre;
    this.showSuggestions = false;
  }

  setRating(val: number) {
    this.movie.rating = val;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async saveMovie() {
    if (!this.movie.title) {
      this.showToast('Zadejte název filmu.');
      return;
    }

    const year = this.movie.year;
    if (!year || year < 1888 || year > 2030 || year.toString().length !== 4) {
      this.showToast('Zadejte platný rok (např. 2023).');
      return;
    }

    this.modalCtrl.dismiss(this.movie, 'confirm');
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }
}