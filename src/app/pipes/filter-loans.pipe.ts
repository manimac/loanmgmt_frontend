import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterLoans'
})
export class FilterLoansPipe implements PipeTransform {

  transform(items: any[], filter1: any, filter2: any): any {
    if (!items || (!filter1 && !filter2)) {
      return items;
    }
    if(!filter1){
      return items.filter(item => ((item.status == filter2)));
    }
    else if(!filter2){
      return items.filter(item => ((item.mobile.startsWith(filter1))));
    }
    else{
      return items.filter(item => ((item.mobile.startsWith(filter1))&&(item.status == filter2)));
    }
  }

}
