import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, searchTerm: string, color: string = '#ffc107'): string {
    if (!searchTerm || !value) {
      return value;
    }

    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedTerm, 'gi');

    return value.replace(regex, match => `<span class="redcolor" style="background-color: ${color};">${match}</span>`);
  }
}
