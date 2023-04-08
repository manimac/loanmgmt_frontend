import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  openProductModal: EventEmitter<any> = new EventEmitter();
  constructor() { }
}
