import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-talent-suite',
  templateUrl: './talent-suite.component.html',
  styleUrls: ['./talent-suite.component.scss']
})
export class TalentSuiteComponent implements OnInit {

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
