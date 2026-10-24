import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EmpleadoFormComponent } from '../empleado-form/empleado-form.component';
import { EmpleadoListComponent } from '../empleado-list/empleado-list.component';
import { Empleado } from '../../models/empleado';
import { environment } from '../../../environments/environment';
import { EmpleadoComponent } from './empleado.component';

const empleado: Empleado = {
  id: '507f1f77bcf86cd799439012',
  nombre: 'Ana Torres',
  cargo: 'Analista',
  departamento: 'Talento',
  sueldo: 1000,
};

describe('Directorio público y edición de empleados', () => {
  let fixture: ComponentFixture<EmpleadoComponent>;
  let http: HttpTestingController;
  const routeData: { publico?: boolean } = {};

  beforeEach(async () => {
    delete routeData.publico;
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [
        EmpleadoComponent,
        EmpleadoFormComponent,
        EmpleadoListComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: routeData } },
        },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  async function abrir(publico = false): Promise<HTMLElement> {
    routeData.publico = publico;
    fixture = TestBed.createComponent(EmpleadoComponent);
    fixture.detectChanges();
    http
      .expectOne(`${environment.apiUrl}/empleados`)
      .flush({ success: true, data: [{ ...empleado }] });
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  async function editarYEscribir(nombre: string): Promise<HTMLElement> {
    const page = await abrir();
    (page.querySelector('.edit-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    const input = page.querySelector('#nombre') as HTMLInputElement;
    expect(input.value).toBe(empleado.nombre);
    input.value = nombre;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return page;
  }

  it('muestra la lista pública sin formulario ni acciones de escritura', async () => {
    const page = await abrir(true);
    expect(page.textContent).toContain('Ana Torres');
    expect(page.textContent).toContain('Consulta pública');
    expect(page.querySelector('app-empleado-form')).toBeNull();
    expect(page.querySelector('.actions-cell')).toBeNull();
    fixture.componentInstance.guardarEmpleado(empleado);
    fixture.componentInstance.eliminarEmpleado(empleado.id!);
    http.expectNone((req) => req.method !== 'GET');
  });

  it('precarga el empleado, envía PUT y actualiza la tabla al guardar', async () => {
    const page = await editarYEscribir('Ana Actualizada');
    expect(page.textContent).toContain('Editar empleado');
    (page.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { cancelable: true }),
    );
    fixture.detectChanges();
    const req = http.expectOne(
      `${environment.apiUrl}/empleados/${empleado.id}`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      nombre: 'Ana Actualizada',
      cargo: 'Analista',
      departamento: 'Talento',
      sueldo: 1000,
    });
    req.flush({
      success: true,
      data: { ...empleado, nombre: 'Ana Actualizada' },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(page.querySelector('table')?.textContent).toContain(
      'Ana Actualizada',
    );
    expect(page.textContent).toContain('Cambios guardados correctamente.');
    expect((page.querySelector('#nombre') as HTMLInputElement).value).toBe('');
    expect(fixture.componentInstance.editando).toBeNull();
  });

  it('conserva el borrador cuando el servidor rechaza la actualización', async () => {
    const page = await editarYEscribir('Ana Borrador');
    (page.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { cancelable: true }),
    );
    http
      .expectOne(`${environment.apiUrl}/empleados/${empleado.id}`)
      .flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect((page.querySelector('#nombre') as HTMLInputElement).value).toBe(
      'Ana Borrador',
    );
    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos guardar',
    );
    expect(page.querySelector('table')?.textContent).toContain('Ana Torres');
  });

  it('cancelar descarta el borrador sin modificar el empleado de la tabla', async () => {
    const page = await editarYEscribir('No guardar');
    (page.querySelector('form .button-outline') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect((page.querySelector('#nombre') as HTMLInputElement).value).toBe('');
    expect(page.querySelector('table')?.textContent).toContain('Ana Torres');
    http.expectNone((req) => req.method === 'PUT');
  });
});
