import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EmpleadoFormComponent } from '../empleado-form/empleado-form.component';
import { EmpleadoListComponent } from '../empleado-list/empleado-list.component';
import { environment } from '../../../environments/environment';

import { EmpleadoComponent } from './empleado.component';

describe('EmpleadoComponent', () => {
  let component: EmpleadoComponent;
  let fixture: ComponentFixture<EmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [EmpleadoComponent, EmpleadoFormComponent, EmpleadoListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/empleados`)
      .flush({ success: true, message: 'OK', data: [] });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
