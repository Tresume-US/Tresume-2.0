import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ContactService } from './contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  contactForm: any;
  contactService: any;
  isNavbarCollapsed = false;

  constructor(private fb: FormBuilder,private contact:ContactService) {

   }
   menuOpen = false;

   toggleMenu() {
     this.menuOpen = !this.menuOpen;
   }

  isScrolled = false;
  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      companyName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      need: ['', Validators.required],
      message: ['', Validators.required],
    });
    window.scrollTo(0,0);

  }
  onPhoneNumberInput(event: any) {
    const inputValue = event.target.value.replace(/[^0-9]/g, '');
    this.contactForm.get('phone').setValue(inputValue);
  }
  submitForm() {
    console.log(this.contactForm.value)
    if (this.contactForm.valid) {
      this.contact.leadenquiry(this.contactForm.value).subscribe(
        (response: any) => {
          console.log('Form submitted successfully:', response);
        },
        (error: any) => {
          console.error('Error submitting form:', error);
        }
      );
    }
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  // @HostListener('window:scroll', [])
  // onWindowScroll() {
  //   const offset = window.scrollY;
  //   this.isScrolled = offset > 50;
}

