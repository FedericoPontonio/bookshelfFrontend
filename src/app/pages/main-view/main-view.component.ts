import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, DecodedToken } from '../../services/auth.service';
import { BookSearchService } from '../../services/openbook-search.service';
import { FormsModule } from '@angular/forms';
import { UserBooksProviderService, Book, CreateBookDTO } from '../../services/user-books-provider.service';

@Component({
  selector: 'app-main-view',
  imports: [CommonModule, FormsModule],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.css'
})
export class MainViewComponent implements OnInit {
  userInfo: DecodedToken | null = null;
  searchedBooks: any[] = [];
  userSavedBooks: any[] = [];
  searchTerm = '';
  isLoading = false;
  popupMessage = '';
  popupMessageVisible = false;
  selectedBook: any = null;
  isModalVisible = false;
  confirmingAdd = false;
  pendingBookToAdd: CreateBookDTO | null = null;
  isManualAddModalVisible = false;



  constructor(private authService: AuthService, private bookSearchService: BookSearchService, private bookService: UserBooksProviderService) {
    this.userInfo = this.authService.getUserInfo();

  }

  saveNotes(): void {
    this.bookService.updateNotes(this.selectedBook.id, this.selectedBook.notes).subscribe({
      next: () => {
        //to force frontend data update
        const userId = +this.userInfo!.userId!;
        this.bookService.getBooksByUserId(userId).subscribe({
        next: (data) => {this.userSavedBooks = data;},
        error: (err) => console.error('Failed to load books', err)
      });
        this.popupMessage = 'Notes saved!';
        this.popupMessageVisible = true;
        setTimeout(() => this.popupMessageVisible = false, 2000);
      },
      error: err => console.error('Failed to save notes', err)
    });
  }

confirmingDelete = false;

confirmDelete() {
  this.bookService.deleteBook(this.selectedBook.id).subscribe({
    next: () => {
      this.userSavedBooks = this.userSavedBooks.filter(b => b.id !== this.selectedBook.id);
      this.closeModal();
      this.confirmingDelete = false;
    },
    error: (err) => {
      console.error('Failed to delete book', err);
      this.confirmingDelete = false;
    }
  });
}
  openModal(book: any): void {
    this.selectedBook = { ...book }; // clone to avoid direct mutation
    setTimeout(() => {
      this.isModalVisible = true;
    }, 10); // allow DOM to paint before transition
  }
  closeModal(): void {
    this.isModalVisible = false;
    this.isManualAddModalVisible = false;
    this.cancelAddBook();
    setTimeout(() => {
      this.selectedBook = null;
      this.confirmingDelete = false;
    }, 300); // match CSS transition duration
  }
  deleteBook(book: any): void {
    const confirmDelete = confirm('Are you sure you want to delete this book?');
    if (!confirmDelete) return;
  
    this.bookService.deleteBook(book.id).subscribe({
      next: () => {
        this.userSavedBooks = this.userSavedBooks.filter(b => b.id !== book.id);
        this.closeModal();
        this.popupMessage = `You have successfully removed " ${book.title}" from your collection.`;
        this.popupMessageVisible = true;
        setTimeout(() => {
          this.popupMessageVisible = false
        }, 2000);
      },
      error: (err) => console.error('Failed to delete book', err)
    });
  }
  

  isDuplicateBook(newBook: CreateBookDTO): boolean {
    return this.userSavedBooks.some(book =>
      book.title.toLowerCase() === newBook.title.toLowerCase() &&
      book.author.toLowerCase() === newBook.author.toLowerCase()
    );
  }

  ngOnInit(): void {
    const userId = +this.userInfo!.userId!;
    this.bookService.getBooksByUserId(userId).subscribe({
      next: (data) => {this.userSavedBooks = data;},
      error: (err) => console.error('Failed to load books', err)
    });

  }

  onSearch(query: string): void {
    this.isLoading = true;
    this.bookSearchService.searchBooks(query).subscribe({
      next: (data) => {
        // console.log('Books found:', data.docs);
        this.searchedBooks = data.docs;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching books', err);
        this.isLoading = false;
        this.searchedBooks = [];
      }
    });
  }

  /** Step 1: stage for confirmation */
  promptAddBook(book: Book) {
    const userId = +this.userInfo!.userId!;
    const dto: CreateBookDTO = {
      userId,
      title: book.title,
      author: book.author_name[0],
      image: book.cover_edition_key
    };
    this.isModalVisible = true;
    if (this.isDuplicateBook(dto)) {
      this.popupMessage = 'You already have this book in your collection.';
      this.popupMessageVisible = true;
      setTimeout(() => this.popupMessageVisible = false, 2000);
      return;
    }

    this.pendingBookToAdd = dto;
    this.confirmingAdd = true;
  }
/** Step 2: when user clicks “Yes” in the modal */
confirmAddBook() {
  if (!this.pendingBookToAdd) return;
  this.bookService.addBookToUser(this.pendingBookToAdd).subscribe({
    next: res => {
      this.userSavedBooks.push(res);
      this.popupMessage = `"${res.title}" added to your collection.`;
      this.popupMessageVisible = true;
      setTimeout(() => this.popupMessageVisible = false, 2000);
      this.pendingBookToAdd = null;
      this.confirmingAdd = false;
      this.isManualAddModalVisible = false;
    },
    error: err => {
      console.error('Add failed', err);
      this.confirmingAdd = false;
    }
  });
}

/** Step 3: cancel */
cancelAddBook() {
  this.pendingBookToAdd = null;
  this.confirmingAdd = false;
  this.isManualAddModalVisible = false;
}
  // old book addition, without 2 steps confirmation
  // addBookToUser(book:Book) {
  //   const userId = +this.userInfo!.userId!;
  //   const bookDTO: CreateBookDTO = {
  //     userId,
  //     title: book.title,
  //     author: book.author_name[0],
  //     image: book.cover_edition_key
  //   }
  //   //avoid book duplication
  //   if (this.isDuplicateBook(bookDTO)) {
  //     this.popupMessage = 'You have already this book in your collection.';
  //     this.popupMessageVisible = true;
  //     setTimeout(() => {
  //       this.popupMessageVisible = false
  //     }, 2000);
  //     return;
  //   }

  //   this.bookService.addBookToUser(bookDTO).subscribe({
  //     next: (res) => {
  //       console.log('Book added:', res);
  //       this.userSavedBooks.push(res); // Optional: update UI immediately
  //     },
  //     error: (err) => console.error('Error adding book', err)
  //   });
  // }

  openManualAddModal(): void {
    const userId = +this.userInfo!.userId!;
    this.pendingBookToAdd = {
      userId,
      title: '',
      author: '',
      image: ''
    };
    this.confirmingAdd = false;
    this.isManualAddModalVisible = true;

  }
  
  logout() {
    this.authService.logout();
  }

}
