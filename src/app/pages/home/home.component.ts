import { Component, OnInit } from '@angular/core';
import { HttpRequestService } from 'src/app/services/http-request/http-request.service';
import Chart from 'chart.js/auto';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  dataLists: any = [];
  public chart: any;
  year: any = 1
  showLoader: boolean = false;
  constructor(private http: HttpRequestService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.showLoader = true;
    this.http.post('pricehistory/chart', { year: this.year }).subscribe(
      (response: any) => {
        this.showLoader = false;
        this.chart = null;
        this.dataLists = response;
        console.log(this.dataLists)
        let labels: any = [];
        let data: any = [];
        this.dataLists.forEach((element: any) => {
          labels.push(element.date);
          data.push(element.value);
        });
        this.createChart(labels, data);
      }, (error: any) => {
        this.showLoader = false;
        this.http.exceptionHandling(error);
      }
    )
  }

  createChart(labels: any, data: any) {
    var oldcanv: any = document.getElementById('canvas');
    if(oldcanv){
      oldcanv.remove();
      // document.removeChild(oldcanv)
    }    
    var canv = document.createElement('canvas');
    canv.id = 'canvas';
    let charContainer: any = document.getElementById('chart-container-id');
    charContainer.appendChild(canv);

    this.chart = new Chart("canvas", {
      type: 'line', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: labels,
        datasets: [
          {
            label: "Price History",
            data: data,
            backgroundColor: '#106eea'
          }
        ]
      },
      options: {
        aspectRatio: 2.5
      }

    });
  }

}
