import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0,0);
  }
  isScrolled = false;
  isNavbarCollapsed = false;
  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }


  // @HostListener('window:scroll', [])
  // onWindowScroll() {
  //   const offset = window.scrollY;
  //   this.isScrolled = offset > 50;
  // }
}
