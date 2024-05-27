import { Component, HostListener, OnInit , Renderer2, OnDestroy} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  activeSection: string = '';
  private observer: IntersectionObserver;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    window.scrollTo(0,0);
    this.setupIntersectionObserver();
  }
  ngOnDestroy(): void {
    this.observer.disconnect();
  }

  setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id;
          this.renderer.addClass(entry.target, 'active-section');
        } else {
          this.renderer.removeClass(entry.target, 'active-section');
        }
      });
    }, options);

    document.querySelectorAll('section').forEach(section => {
      this.observer.observe(section);
    });
  }

  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
  isScrolled = false;
  isNavbarCollapsed = false;
  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }


  @HostListener('window:scroll', [])
  onWindowScroll() {
    const offset = window.scrollY;
    this.isScrolled = offset > 50;
  }
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  

}

