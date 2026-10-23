import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { EmpleadoService } from './empleado.service';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { environment } from '../../environments/environment';

describe('Sesión JWT e interceptor', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let empleados: EmpleadoService;
  const router = { navigateByUrl: jasmine.createSpy().and.resolveTo(true) };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
      { provide: Router, useValue: router }
    ] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    empleados = TestBed.inject(EmpleadoService);
  });
  afterEach(() => { auth.ngOnDestroy(); http.verify(); });

  function login(): void {
    auth.login('test@example.com', 'test-password').subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ success: true, message: 'OK',
      data: { token: 'test-token', expiresIn: 900,
        usuario: { id: '1', nombre: 'Test', email: 'test@example.com' } } });
  }

  it('adjunta el token a empleados y limpia la sesión cuando la API devuelve 401', () => {
    login();
    empleados.cargarEmpleados().subscribe({ error: () => {} });
    const req = http.expectOne(`${environment.apiUrl}/empleados`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.accessToken).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('borra empleados y token al cerrar sesión', () => {
    login();
    const clear = spyOn(empleados, 'limpiar').and.callThrough();
    auth.logout();
    expect(auth.accessToken).toBeNull();
    expect(clear).toHaveBeenCalled();
  });

  it('no envía el token a un origen externo', () => {
    login();
    TestBed.inject(HttpClient).get('https://example.com/data').subscribe();
    const req = http.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('expira automáticamente la sesión', fakeAsync(() => {
    login();
    tick(900000);
    expect(auth.accessToken).toBeNull();
  }));
});
