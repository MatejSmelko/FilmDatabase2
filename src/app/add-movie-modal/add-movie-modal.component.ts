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

  // Seznam všech žánrů
  allGenres: string[] = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 
    'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 
    'History', 'Horror', 'Music', 'Musical', 'Mystery', 
    'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
  ];

  // Aktuálně nalezené shody
  filteredGenres: string[] = [];
  
  // Ovládá viditelnost našeptávače
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

  // --- NOVÉ: Funkce pro nahrání obrázku ---
  onFileSelected(event: any) {
    const file = event.target.files[0]; // Vezmeme první vybraný soubor
    
    if (file) {
      // Kontrola velikosti (volitelné): Varování, pokud je > 2MB
      if (file.size > 2 * 1024 * 1024) {
        this.showToast('Image is too large! Try a smaller one.');
        return;
      }

      const reader = new FileReader();
      // Až se soubor načte, uložíme ho jako text (Base64)
      reader.onload = () => {
        this.movie.imageUrl = reader.result as string;
      };
      // Spustíme čtení
      reader.readAsDataURL(file);
    }
  }
  
  // 1. Funkce se volá při každém stisknutí klávesy
  onGenreInput(event: any) {
    const query = event.target.value;

    // Pokud je políčko prázdné, skryjeme nabídku
    if (!query || query.trim() === '') {
      this.showSuggestions = false;
      return;
    }

    // Filtrujeme seznam (ignorujeme velká/malá písmena)
    this.filteredGenres = this.allGenres.filter(g => 
      g.toLowerCase().startsWith(query.toLowerCase())
    );

    // Pokud jsme něco našli, zobrazíme nabídku
    this.showSuggestions = this.filteredGenres.length > 0;
  }

  // 2. Když uživatel klikne na položku v našeptávači
  selectGenre(genre: string) {
    this.movie.genre = genre; // Vyplníme input
    this.showSuggestions = false; // Skryjeme nabídku
  }

  // Klikání na hvězdičky
  setRating(val: number) {
    this.movie.rating = val;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async saveMovie() {
    if (!this.movie.title) {
      this.showToast('Please enter a movie title.');
      return;
    }

    const year = this.movie.year;
    if (!year || year < 1888 || year > 2030 || year.toString().length !== 4) {
      this.showToast('Please enter a valid 4-digit year.');
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