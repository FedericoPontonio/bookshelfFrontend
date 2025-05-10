import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('authToken');

  const isExternalRequest = !req.url.startsWith('https://bookshelf-fuio.onrender.com') && !req.url.startsWith('/api');

  if (isExternalRequest) {
    return next(req);
  }


  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
