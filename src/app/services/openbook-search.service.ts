import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookSearchService {
  private apiUrl = 'https://openlibrary.org/search.json';

  constructor(private http: HttpClient) {}

  searchBooks(query: string, page: number = 1): Observable<any> {
    // const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}`;
    const url = `https://openlibrary.org/search.json?q=${query}&limit=10`
    return this.http.get<any>(url);
  }
}
