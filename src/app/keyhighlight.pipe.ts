import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyhighlight'
})
export class KeyhighlightPipe implements PipeTransform {

 
  transform(value: string, keyWord: string, color: string = '#ffc107'): string {
    if (!keyWord || !value) {
      return value;
    }

    const escapedTerm = keyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedTerm, 'gi');

    return value.replace(regex, match => `<span class="redcolor" style="background-color: ${color};">${match}</span>`);
  }

}
