import { Component, Input, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

import { IconRocket } from '../../../shared/ui/icons/rocket';
import { IconBack } from '../../../shared/ui/icons/back';
import { ContactsService } from '../../data-access/contacts.service';
import { ContactForm } from '../../shared/interfaces/contacts.interface';
import { MatInput } from '@angular/material/input';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';

export interface CreateForm {
  fullName: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  description?: FormControl<string | undefined>;
}

@Component({
  selector: 'app-contact-create',
  template: `
    <div class="px-4 xl:px-0 w-full max-w-[600px] m-auto">
      <form [formGroup]="form" (ngSubmit)="createContact()">
        <div class="mb-8">
          <label for="first_name" class="block mb-2 text-sm font-medium"
            >Nombre:</label
          >
          <input
            matInput type="text"
            id="first_name"
            class="w-full p-3 rounded-md text-sm bg-transparent border-gray-500 border"
            formControlName="fullName"
          />
          @if(firtsField.hasError('required')){
					<mat-error> Ingrese el nombre </mat-error>
					}
        </div>
        <div class="mb-8">
          <label for="email" class="block mb-2 text-sm font-medium"
            >Email:</label
          >
          <input
             matInput type="text"
            id="email"
            class="w-full p-3 rounded-md text-sm bg-transparent border-gray-500 border"
            formControlName="email"
          />
          @if(emailField.hasError('required')){
					<mat-error>Ingrese el e-mail </mat-error>
					} @if(emailField.hasError('email')){
					<mat-error> Ingrese un e-mail valido (ejemplo&#64;mail.com)</mat-error>
					}
        </div>
        <div class="mb-8">
          <label for="phoneNumber" class="block mb-2 text-sm font-medium"
            >Número Telefónico:</label
          >
          <input
            type="text"
            id="phoneNumber"
            class="w-full p-3 rounded-md text-sm bg-transparent border-gray-500 border"
            formControlName="phoneNumber"
          />
          @if(phoneNumber.hasError('required')){
					<mat-error>Ingrese el número telefónico </mat-error>
					} @if(phoneNumber.hasError('pattern')){
					<mat-error> Ingrese solo números </mat-error>
					}
        </div>
        <div class="mb-8">
          <label for="description" class="block mb-2 text-sm font-medium"
            >Descripción: (opcional)</label
          >
          <textarea
            rows="5"
            type="text"
            id="description"
            class="w-full p-3 rounded-md text-sm bg-transparent border-gray-500 border"
            placeholder="Breve descripción"
            formControlName="description"
          ></textarea>
        </div>

        <div class="flex justify-between items-center">
          <a
            class="text-sm flex text-nowrap items-center gap-x-2 hover:text-gray-300 transition-[color] ease-in-out duration-200 p-4 cursor-pointer"
            routerLink="/dashboard"
          >
            <app-icon-back />
            Regresar
          </a>

          <button
            class="text-sm flex text-nowrap items-center gap-x-2 hover:text-gray-300 transition-[color] ease-in-out duration-200 p-4 cursor-pointer"
            type="submit"
          >
            <app-icon-rocket />
            @if (contactId) { Editar contacto } @else { Crear contacto }
          </button>
        </div>
      </form>
    </div>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, IconRocket, IconBack, RouterLink, MatInput, MatError],
})
export default class ContactCreateComponent {
  private _formBuilder = inject(FormBuilder).nonNullable;

  private _router = inject(Router);

  private _contactsService = inject(ContactsService);

  private _contactId = '';

  get contactId(): string {
    return this._contactId;
  }

  @Input() set contactId(value: string) {
    this._contactId = value;
    this.setFormValues(this._contactId);
  }

  form = this._formBuilder.group<CreateForm>({
    fullName: this._formBuilder.control('', Validators.required),
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    phoneNumber: this._formBuilder.control('', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
    description: this._formBuilder.control(''),
  });

  async createContact() {
    if (this.form.invalid) return;

    try {
      const contact = this.form.value as ContactForm;
      !this.contactId
        ? await this._contactsService.createContact(contact)
        : await this._contactsService.updateContact(this.contactId, contact);
      this._router.navigate(['/dashboard']);
    } catch (error) {
      // call some toast service to handle the error
    }
  }

  async setFormValues(id: string) {
    try {
      const contact = await this._contactsService.getContact(id);
      if (!contact) return;
      this.form.setValue({
        fullName: contact.fullName,
        email: contact.email,
        phoneNumber: contact.phoneNumber,
        description: contact.description,
      });
    } catch (error) {}
  }

  get firtsField(): FormControl<string> {
		return this.form.controls.fullName;
	}
  get emailField(): FormControl<string> {
		return this.form.controls.email;
	}

  get phoneNumber(): FormControl<string> {
		return this.form.controls.phoneNumber;
	}
}
