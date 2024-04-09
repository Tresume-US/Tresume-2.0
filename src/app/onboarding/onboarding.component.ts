import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';
import { OnboardingService } from './onboarding.service';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  providers: [OnboardingService]
})
export class OnboardingComponent implements OnInit {


  /* todo = [
    'Offer Letter',
    'I-9',
    'ID',
    'NCA',
    'Employee Handbook',
    'Agreement',
    'State Tax form',
    'Void Check',
    'Tracker',
    'Insurance',
    'Direct Deposit',
    'Performance',
    'I-20',
    'EAD',
    'CPT',
    'H-1B',
    'Wages',
    'Labor',
    'I-140',
    'I-485',
    'GC',
    'Work Order',
    'MSA',
    'Vacation Documents',
    'Termination',
    'Other'
  ]; */

  done = [

  ];

  public availableItems: any[] = [];
  public cardItems: any[] = [];
  public cards: any[] = [];
  public newChecklistID: number;

  selectedDocs = ['Offer Letter',
    'I-9',
    'ID',
    'Employee Handbook',
    'Agreement']

  myColor: string;
  checklistName: string;
  newSelectedDocs: any[] = [];
  toggleAdd: boolean = false;
  public OrgID: any;
  public onModifylist: boolean = false;
  public modifylistID: any;


  /* cards: any[] = [
    {
      name: "W2 Employee Paperwork",
      category: "Employee Task",
      selectedDocs: this.selectedDocs
    },
    {
      name: "C2C Employee Paperwork",
      category: "Employee Task",
      selectedDocs: this.selectedDocs
    },
    {
      name: "Back-office Employee Paperwork",
      category: "Employee Task",
      selectedDocs: this.selectedDocs
    }
  ]; */

  constructor(private service: OnboardingService, private cookieService: CookieService) { }

  formControl = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.OrgID = this.cookieService.get('OrgID')
    this.getLists();
  }

  public getLists() {
    let requestItem: any = {
      OrgID: this.OrgID || 9,
    }
    this.service.getChecklists(requestItem).subscribe((x: any) => {
      const source = from(x);
      const example = source.pipe(
        groupBy((y: any) => y.ListID),
        mergeMap(group => group.pipe(toArray()))
      );
      const subscribe = example.subscribe(val => {
        this.cardItems.push(val);
      });
      for (let card of this.cardItems) {
        if (card.length > 1) {
          let seldocs: any[] = [];
          for (let docs of card) {
            let docItem = {
              DocTypeName: docs.DocTypeName,
              DocTypeID: docs.DocTypeID
            }
            seldocs.push(docItem)
          }
          let namelist = {
            name: card[0].ListName,
            id: card[0].ListID,
            category: card[0].ListType,
            selectedDocs: seldocs
          }
          this.cards.push(namelist);
        }
        else {
          let namelist = {
            name: card[0].ListName,
            id: card[0].ListID,
            category: card[0].ListType,
            selectedDocs: [{ DocTypeName: card[0].DocTypeName, DocTypeID: card[0].DocTypeID }]
          }
          this.cards.push(namelist);
        }
        console.log('this.cards', this.cards)

      }
    });
    this.service.getDocTypes(requestItem).subscribe((x: any) => {
      this.availableItems = x;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    //this.newSelectedDocs = event.container.data;
  }

  addNewList() {
    this.onModifylist = false;
    this.toggleAdd = true;
    this.done = [];
  }

  modifyCard(card: any, i: number) {
    console.log('card', card)
    this.toggleAdd = true;
    this.checklistName = card.name;
    this.done = card.selectedDocs;
    this.onModifylist = true;
    this.modifylistID = card.id;
  }

  save() {
    if (this.onModifylist) {
      this.deleteCard(this.modifylistID);
    }
    let req = {

    }
    this.service.getNewChecklistID(req).subscribe((x: any) => {
      console.log('x', x)
      this.newChecklistID = x[0].ID;
      let newcard = {
        name: this.checklistName,
        category: "Employee",
        selectedDocs: this.done
      }
      this.cards.push(newcard);
      this.done.forEach((items: any, i) => {
        console.log('items', items)
        let request = {
          ListID: this.newChecklistID,
          OrgID: this.OrgID || 9,
          ListName: this.checklistName,
          docTypeID: items.DTID || items.DocTypeID,
          Position: i + 1
        }
        this.service.saveChecklists(request).subscribe(x => {
        });
      });
      this.cards = [];
      this.cardItems = [];
      this.getLists();
      this.formControl.reset();
      this.toggleAdd = false;
    });
  }

  deleteCard(id: number) {
    let req = {
      id:id
    }
    this.service.deleteChecklist(req).subscribe(x => {
      if (!this.onModifylist) {
        this.cards = [];
        this.cardItems = [];
        this.getLists();
      }
    });
  }

}

/* const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>); */
