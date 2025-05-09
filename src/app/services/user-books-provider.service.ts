import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  title: string;
  author_name: string;
  cover_edition_key: string;
}

export interface CreateBookDTO {
  userId: number;
  title: string;
  author: string;
  image: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserBooksProviderService {
  private apiUrl = 'http://localhost:5154/api/Book';
  constructor(private http: HttpClient) { }

  getBooksByUserId(userId: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/user/${userId}`);
  }

  addBookToUser(book:CreateBookDTO): Observable<any> {
    console.log(book)
    return this.http.post(`${this.apiUrl}`, book)
  }

  deleteBook(bookId: number) {
    return this.http.delete(`${this.apiUrl}/${bookId}`);
  }

  updateNotes(bookId: number, notes: string) {
    const body = JSON.stringify(notes);
    return this.http.put(`${this.apiUrl}/notes/${bookId}`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

}
