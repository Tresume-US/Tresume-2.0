import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-workforce',
  templateUrl: './workforce.component.html',
  styleUrls: ['./workforce.component.scss']
})
export class WorkforceComponent implements OnInit {

  constructor() { }


  isScrolled = false;
  isNavbarCollapsed = false;

  // @HostListener('window:scroll', [])
  // onWindowScroll() {
  //   const offset = window.scrollY;
  //   this.isScrolled = offset > 50; // You can adjust the offset value based on your design
  // }


  ngOnInit(): void {
    window.scrollTo(0,0);
  }

//   @HostListener('window:scroll', [])
//   onWindowScroll() {
//     const offset = window.scrollY;
//     this.isScrolled = offset > 50;
// }
toggleNavbar() {
  this.isNavbarCollapsed = !this.isNavbarCollapsed;
}
menuOpen = false;

toggleMenu() {
  this.menuOpen = !this.menuOpen;
}
}
