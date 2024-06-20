import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0,0);
  }
  isScrolled = false;
  isNavbarCollapsed = false;

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
