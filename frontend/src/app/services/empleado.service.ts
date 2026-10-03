import {Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Empleado } from '../models/empleado';

@Injectable({ providedIn: 'root' })

export class EmpleadoService {

  URL_API='http://localhost:3000/api/v1/empleados';

  //URL_API='assets/json/empleado.json';

 // URL_API='https://jsonplaceholder.typicode.com/users';

  empleados: Empleado[] = [];
  selectedEmpleado: Empleado={ nombre:'', cargo:'', departamento:'', sueldo:0 }

  constructor(private http: HttpClient) {
      console.log("El servicio está funcionando...");
  }
  getEmpleados(){
    return this.http.get<Empleado[]>(this.URL_API);

  }
  createEmpleado(empleado:Empleado){
    return this.http.post(this.URL_API,empleado);
  }
}
