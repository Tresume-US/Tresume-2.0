import { Component, HostListener, OnInit , Renderer2, OnDestroy,ElementRef, ViewChild,AfterViewInit} from '@angular/core';


export interface Message {
  sender: 'bot' | 'user';
  content: string;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit  {
  @ViewChild('video', { static: false }) video: ElementRef<HTMLVideoElement>;
  @ViewChild('chatBot', { static: false }) chatBot: ElementRef<HTMLDivElement>;
  messages: string[] = ["Hi there! Welcome to Tresume! How can I assist you today?"];
  userInput: string = '';
  step: number = 0;
  userDetails: any = {};
  options: string[] = ["Learn about Tresume", "Request a demo", "Pricing information", "Support", "Other"];
  showInput: boolean = false;
  industryOptions: string[] = [
    "Applicant Tracking System (ATS)", 
    "Employee Management", 
    "Payroll Processing", 
    "Performance Evaluation", 
    "Recruitment Analytics", 
    "Customizable Reports"
  ];


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
  
  // scrollToSection(section: string) {
  //   this.activeSection = section;
  //   const element = document.getElementById(section);
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }
  // toggleChatBot() {
  //   const chatBotElement = this.chatBot.nativeElement;
  //   if (chatBotElement.classList.contains('d-none')) {
  //     this.renderer.removeClass(chatBotElement, 'd-none');
  //   } else {
  //     this.renderer.addClass(chatBotElement, 'd-none');
  //   }
  // }



  toggleChatBot() {
    const chatBotElement = this.chatBot.nativeElement;
    if (chatBotElement.classList.contains('d-none')) {
      this.renderer.removeClass(chatBotElement, 'd-none');
    } else {
      this.renderer.addClass(chatBotElement, 'd-none');
    }
  }
  
  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push(this.userInput);
      this.handleUserResponse(this.userInput.trim());
      this.userInput = '';
    }
  }
  
  // handleButtonClick(option: string) {
  //   this.messages.push(option);
  //   this.handleUserResponse(option);
  // }
  
  handleUserResponse(response: string) {
    switch (this.step) {
      case 0:
        this.handleWelcome(response);
        break;
      case 1:
        this.handleDemo(response);
        break;
      // case 2:
      //   this.handleLearn(response);
      //   break;
      case 3:
        this.handlePricing(response);
        break;
      case 4:
        this.handleSupport(response);
        break;
      default:
        this.messages.push("Thank you for visiting Tresume! Have a great day!");
        this.showInput = false;
    }
  }

  handleWelcome(response: string) {
    this.showInput = false;
    if (response.toLowerCase().includes("demo")) {
      this.messages.push("Great! To get started, could you please provide your full name?");
      this.step = 1;
      this.showInput = true;
      this.options = [];
    } else if (response.toLowerCase().includes("learn")) {
      this.messages.push("Tresume is a comprehensive HRMS solution. What area are you most interested in learning about?");
      this.step = 2;
      this.showInput = true;
      this.options = [];
    } else if (response.toLowerCase().includes("pricing")) {
      this.messages.push("Our pricing is tailored to your needs. How many employees does your company have?");
      this.step = 3;
      this.showInput = true;
      this.options = [];
    } else if (response.toLowerCase().includes("support")) {
      this.messages.push("I’m here to help! Can you please describe the issue you’re facing or the assistance you need?");
      this.step = 4;
      this.showInput = true;
      this.options = [];
    } else {
      this.messages.push("How can I assist you today? Please choose any of this.");
      this.options = ["Learn about Tresume", "Request a demo", "Pricing information", "Support", "Other"];
    }
  }
  handleDemo(response: string) {
    this.showInput = true; // Assume the next step requires text input
    switch (this.step) {
      case 1:
        this.userDetails.name = response;
        this.messages.push(`Thanks, ${this.userDetails.name}! Can you share your email address so we can send you the demo details?`);
        this.step++;
        break;
      case 2:
        this.userDetails.email = response;
        this.messages.push("Excellent! What is the name of your company?");
        this.step++;
        break;
      case 3:
        this.userDetails.company = response;
        this.messages.push("Thanks! Can you let us know your role in the company?");
        this.step++;
        break;
      case 4:
        this.userDetails.role = response;
        this.messages.push("Perfect. Lastly, what specific features or aspects of Tresume are you most interested in?");
        this.step++;
        this.showInput = false;
        this.options = ["Applicant Tracking System (ATS)", "Employee Management", "Payroll Processing", "Performance Evaluation", "Recruitment Analytics", "Customizable Reports"];
        break;
      case 5:
        this.userDetails.interests = response;
        this.messages.push("Thank you for providing the details. We’ll arrange your demo and send you the details shortly. Is there anything else I can help you with?");
        this.step = 0;
        this.showInput = false;
        this.options = ["Learn about Tresume", "Request a demo", "Pricing information", "Support", "Other"];
        break;
    }
  }
    
  // handleLearn(response: string) {
  //   this.showInput = true; // Assume the next step requires text input
  //   switch (this.step) {
  //     case 2:
  //       this.userDetails.learnInterest = response;
  //       this.messages.push("Could you tell me more about your company's industry or field?");
  //       this.step++;
  //       break;
  //     case 3:
  //       this.userDetails.industry = response;
  //       this.messages.push("What is the size of your company (number of employees)?");
  //       this.step++;
  //       this.showInput = false;
  //       this.options = ["1-50", "51-200", "201-500", "501+"];
  //       break;
  //     case 4:
  //       this.userDetails.companySize = response;
  //       this.messages.push("What challenges are you currently facing with your HR processes?");
  //       this.step++;
  //       this.showInput = true;
  //       this.options = [];
  //       break;
  //     case 5:
  //       this.userDetails.challenges = response;
  //       this.messages.push("Would you be interested in a personalized demo to see how Tresume can help you address these challenges?");
  //       this.step++;
  //       this.showInput = false;
  //       this.options = ["Yes", "No"];
  //       break;
  //     case 6:
  //       if (response.toLowerCase() === 'yes') {
  //         this.messages.push("Great! Please provide your contact details so we can arrange the demo.");
  //         this.showInput = true;
  //       } else {
  //         this.messages.push("Thank you for your time. Is there anything else I can help you with?");
  //         this.step = 0;
  //         this.showInput = false;
  //         this.options = ["Learn about Tresume", "Request a demo", "Pricing information", "Support", "Other"];
  //       }
  //       break;
  //   }
  // }
  handlePricing(response: string) {
    this.showInput = true; // Assume the next step requires text input
    switch (this.step) {
      case 3:
        this.userDetails.companySize = response;
        this.messages.push("What specific features are you interested in?");
        this.step++;
        this.showInput = false;
        this.options = ["Applicant Tracking System (ATS)", "Employee Management", "Payroll Processing", "Performance Evaluation", "Recruitment Analytics", "Customizable Reports"];
        break;
      case 4:
        this.userDetails.features = response;
        this.messages.push("Can you provide your company name and website?");
        this.step++;
        this.showInput = true;
        this.options = [];
        break;
      case 5:
        this.userDetails.companyDetails = response;
        this.messages.push("What is your role in the company?");
        this.step++;
        break;
      case 6:
        this.userDetails.role = response;
        this.messages.push("Could you please share your contact details so our sales team can get in touch with you with a customized pricing plan?");
        this.step++;
        break;
      case 7:
        this.userDetails.contactDetails = response;
        this.messages.push("Thank you! Our team will reach out to you soon. Is there anything else I can help you with?");
        this.step = 0;
        this.showInput = false;
        this.options = ["Learn about Tresume", "Request a demo", "Pricing information", "Support", "Other"];
        break;
    }
  }
  handleSupport(response: string) {
    this.showInput = true; // Assume the next step requires text input
    switch (this.step) {
      case 4:
        this.userDetails.issue = response;
        this.messages.push("Thank you for the details. Can you provide your name and email address so we can follow up with you?");
        this.step++;
        break;
      case 5:
        this.userDetails.name = response;
        this.messages.push("What is your company name?");
        this.step++;
        break;
      case 6:
        this.userDetails.company = response;
        this.messages.push("Can you specify which feature or section of Tresume you need help with?");
        this.step++;
        break;
      case 7:
        this.userDetails.feature = response;
        this.messages.push("When did you start experiencing this issue?");
        this.step++;
        break;
      case 8:
        this.userDetails.timeframe = response;
        this.messages.push("Thank you for the information. Our support team will get back to you shortly. Is there anything else I can help you with?");
        this.step = 0;
        this.showInput = false;
        this.options = ["Learn about Tresume", "Request a demo", "Pricing information", "Support", "Other"];
        break;
    }
  }
  // backToMainMenu() {
  //   this.step = 0;
  //   this.showInput = true;
  //   this.messages = ["Hi there! Welcome to Tresume! How can I assist you today?"];
  // }

  // handleButtonClick(option: string) {
  //   this.messages.push(`You selected: ${option}`);
  //   this.showInput = false;
  //   this.options = [];
  //   switch (option.toLowerCase()) {
  //     case 'learn about treresume':
  //       this.step = 2;
  //       this.handleLearn("Initial");
  //       break;
  //     case 'request a demo':
  //       this.step = 1;
  //       this.handleDemo("Initial");
  //       break;
  //     case 'pricing information':
  //       this.step = 3;
  //       this.handlePricing("Initial");
  //       break;
  //     case 'support':
  //       this.step = 4;
  //       this.handleSupport("Initial");
  //       break;
  //     case 'other':
  //       this.messages.push("Please specify your query.");
  //       break;
  //     default:
  //       this.messages.push("Please select one of the available options.");
  //   }
  // }

  handleButtonClick(option: string) {
    this.messages.push(option);
    this.showInput = true;
    this.options = [];
    switch (option) {
      case 'Learn about Tresume':
        this.step = 2;
        this.messages.push('Tresume is a comprehensive HRMS solution. What area are you most interested in learning about?');
        this.showOptions(['Applicant Tracking System (ATS)', 'Employee Management', 'Payroll Processing', 'Performance Evaluation', 'Recruitment Analytics', 'Customizable Reports']);
        break;
      case 'Request a demo':
        this.step = 1;
        this.messages.push('Great! To get started, could you please provide your full name?');
        break;
      case 'Pricing information':
        this.step = 3;
        this.messages.push('Our pricing is tailored to your needs. How many employees does your company have?');
        this.showOptions(['1-50', '51-200', '201-500', '501+']);
        break;
      case 'Support':
        this.step = 4;
        this.messages.push('I’m here to help! Can you please describe the issue you’re facing or the assistance you need?');
        break;
      case 'Other':
        this.messages.push('Please describe your query.');
        break;
      default:
        this.step = 0;
        this.sendWelcomeMessage();
        this.showOptions(['Learn about Tresume', 'Request a demo', 'Pricing information', 'Support', 'Other']);
    }
  }

  sendWelcomeMessage() {
    this.messages.push('Hi there! Welcome to Tresume! How can I assist you today?');
  }
  showOptions(options: string[]) {
    this.options = options;
    this.showInput = false;
  }



  handlePredefinedQuery(input: string): boolean {
    const lowerCaseInput = input.toLowerCase();
    switch (this.step) {
      case 1:
        return this.handleDemoStep(lowerCaseInput);
      case 2:
        return this.handleLearnStep(lowerCaseInput);
      case 3:
        return this.handlePricingStep(lowerCaseInput);
      case 4:
        return this.handleSupportStep(lowerCaseInput);
      default:
        return false;
    }
  }




  handleDemoStep(input: string): boolean {
    if (!this.userDetails.name) {
      this.userDetails.name = input;
      this.messages.push(`Thanks, ${this.userDetails.name}! Can you share your email address so we can send you the demo details?`);
      return true;
    } else if (!this.userDetails.email) {
      this.userDetails.email = input;
      this.messages.push('Excellent! What is the name of your company?');
      return true;
    } else if (!this.userDetails.company) {
      this.userDetails.company = input;
      this.messages.push('Thanks! Can you let us know your role in the company?');
      return true;
    } else if (!this.userDetails.role) {
      this.userDetails.role = input;
      this.messages.push('Perfect. Lastly, what specific features or aspects of Tresume are you most interested in?');
      this.showOptions(['Applicant Tracking System (ATS)', 'Employee Management', 'Payroll Processing', 'Performance Evaluation', 'Recruitment Analytics', 'Customizable Reports']);
      return true;
    } else if (!this.userDetails.feature) {
      this.userDetails.feature = input;
      this.messages.push('Thank you for providing the details. We’ll arrange your demo and send you the details shortly. Is there anything else I can help you with?');
      this.showOptions(['Yes', 'No']);
      return true;
    }
    return false;
  }

  handleLearnStep(input: string): boolean {
    const learnOptions = ['applicant tracking system (ats)', 'employee management', 'payroll processing', 'performance evaluation', 'recruitment analytics', 'customizable reports'];
    if (learnOptions.includes(input)) {
      this.messages.push('Could you tell me more about your company\'s industry or field?');
      this.showOptions(['IT', 'Healthcare', 'Finance', 'Manufacturing', 'Education', 'Other']);
      return true;
    } else if (!this.userDetails.industry) {
      this.userDetails.industry = input;
      this.messages.push('What is the size of your company (number of employees)?');
      this.showOptions(['1-50', '51-200', '201-500', '501+']);
      return true;
    } else if (!this.userDetails.companySize) {
      this.userDetails.companySize = input;
      this.messages.push('What challenges are you currently facing with your HR processes?');
      return true;
    } else if (!this.userDetails.challenges) {
      this.userDetails.challenges = input;
      this.messages.push('Would you be interested in a personalized demo to see how Tresume can help you address these challenges?');
      this.showOptions(['Yes', 'No']);
      return true;
    } else if (input === 'yes') {
      this.messages.push('Great! Please provide your contact details so we can arrange the demo.');
      return true;
    }
    return false;
  }

  handlePricingStep(input: string): boolean {
    if (['1-50', '51-200', '201-500', '501+'].includes(input)) {
      this.messages.push('What specific features are you interested in?');
      this.showOptions(['Applicant Tracking System (ATS)', 'Employee Management', 'Payroll Processing', 'Performance Evaluation', 'Recruitment Analytics', 'Customizable Reports']);
      return true;
    } else if (!this.userDetails.features) {
      this.userDetails.features = input;
      this.messages.push('Can you provide your company name and website?');
      return true;
    } else if (!this.userDetails.companyName) {
      this.userDetails.companyName = input;
      this.messages.push('What is your role in the company?');
      return true;
    } else if (!this.userDetails.role) {
      this.userDetails.role = input;
      this.messages.push('Could you please share your contact details so our sales team can get in touch with you with a customized pricing plan?');
      return true;
    } else if (!this.userDetails.contact) {
      this.userDetails.contact = input;
      this.messages.push('Thank you! Our team will reach out to you soon. Is there anything else I can help you with?');
      this.showOptions(['Yes', 'No']);
      return true;
    }
    return false;
  }

  handleSupportStep(input: string): boolean {
    if (!this.userDetails.issue) {
      this.userDetails.issue = input;
      this.messages.push('Thank you for the details. Can you provide your name and email address so we can follow up with you?');
      return true;
    } else if (!this.userDetails.name) {
      this.userDetails.name = input;
      this.messages.push('What is your company name?');
      return true;
    } else if (!this.userDetails.company) {
      this.userDetails.company = input;
      this.messages.push('Can you specify which feature or section of Tresume you need help with?');
      return true;
    } else if (!this.userDetails.feature) {
      this.userDetails.feature = input;
      this.messages.push('When did you start experiencing this issue?');
      return true;
    } else if (!this.userDetails.timeframe) {
      this.userDetails.timeframe = input;
      this.messages.push('Thank you for the information. Our support team will get back to you shortly. Is there anything else I can help you with?');
      this.showOptions(['Yes', 'No']);
      return true;
    }
    return false;
  }

  backToMainMenu() {
    this.step = 0;
    this.userDetails = {};
    this.messages.push('Back to Main Menu');
    this.sendWelcomeMessage();
    this.showOptions(['Learn about Tresume', 'Request a demo', 'Pricing information', 'Support', 'Other']);
  }

  // showPopoverMessage() {
  //   const chatIcon = document.querySelector('.animated-icon');
  //   chatIcon.classList.add('popover-show');
  //   setTimeout(() => chatIcon.classList.remove('popover-show'), 5000);
  // }












  // handleLearn(response: string) {
  //   if (this.step === 2) {
  //     this.messages.push("Could you tell me more about your company's industry or field? please select the below options");
  //     this.showInput = false;
  //     this.options = this.industryOptions;
  //     this.step = 3; // Move to the next step or handle selection
  //   } else if (this.step === 3) {
  //     // Handle the response from industry options
  //     this.userDetails.industry = response;
  //     this.messages.push("What is the size of your company (number of employees)? 1-50, 51-200, 201-500, 501+");
  //     this.step++;
  //     this.options = [];
  //     this.showInput = true;
  //   }
  // }
}

