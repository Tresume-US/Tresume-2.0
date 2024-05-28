import { Component, HostListener, OnInit , Renderer2, OnDestroy,ElementRef, ViewChild,AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit  {
  @ViewChild('video', { static: false }) video: ElementRef<HTMLVideoElement>;

  activeSection: string = '';
  private observer: IntersectionObserver;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(){
    window.scrollTo(0,0);
    this.setupIntersectionObserver();
    const videoElement = this.video.nativeElement;
    videoElement.muted = true;
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.playsInline = true;

    // Attempt to play the video programmatically
    videoElement.load();
    videoElement.play().catch(error => {
      console.log('Error attempting to play the video:', error);
    });
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

