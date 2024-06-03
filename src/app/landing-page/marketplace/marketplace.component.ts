import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {

isScrolled = false;
isNavbarCollapsed = false;


  constructor() { }

  cards = [
    { title: 'OPT Nation', text: 'Premium Job Board', imageSrc: 'assets/img/opt.png', link: 'opt-nation' },
    { title: 'Jooblee', text: 'Free Job Board', imageSrc: 'https://in.jooble.org/job-description/wp-content/uploads/2020/03/logo2.svg', link: 'jooble' },
    { title: 'Career Builder', text: 'Premium Job Board', imageSrc: 'assets/img/cb.png', link: 'career' },
    { title: 'Dice', text: 'Premium Job Board', imageSrc: 'assets/img/dice.png', link: 'dice' },
    { title: 'Monster', text: 'Premium Job Board', imageSrc: 'assets/img/monster_logo.svg', link: 'monster' },
    { title: '', text: 'Job Boards', imageSrc: '', link: '' }
  ];
  others = [
    { title: 'Yahoo', text: 'Email Integration', imageSrc: 'assets/img/yahoo.png', link: 'yahoo' },
    { title: 'Adobee', text: 'Digital Signature', imageSrc: 'assets/img/adobe.png', link: 'adobe' },
  ];

  ngOnInit(): void {
    window.scrollTo(0,0);
  }
  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  selectedCardIndex: number | null = null;

  selectCard(index: number) {
    this.selectedCardIndex = index;
  }
}
