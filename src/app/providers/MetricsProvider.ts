import { Application } from "express";
import PromClient from 'prom-client';
import { injectable } from "inversify";
import { Registerable } from "../Registerable";
export interface MetricCollectorInterface extends Registerable {
     /**
      * All the Metrics will have a Name, Value(s) and Tag(s)
      */

     /**
      * Function to register metrics exposing route to the App
      * @param app Application: The Express Application
      */
     register(app: Application): Application

     /**
      * Increments a counter registered in the Collector
      * Creates a new Counter when the counter doesn't exist
      * @param name Name of the Counter
      * @param tags The Tags that will be used to Query/Group Results
      * @param description The Description of the Counter ( Used only the first time )
      */
     incrementCounter(name: string, tags?: any, description?: string): any;

     /**
      * Registers a default set of Node metrices to the Collector
      */
     collectDefaultMetrices(): void

     /**
      * 
      * @param name Name of the Histogram
      * @param val The Value to set
      * @param tags The tags to Query/Group the results
      * @param description The Description of the Histogram ( Used only the first time ) 
      */
     histogram(name: string, val: number, tags?: any, description?: string): any;

     /**
      * 
      * @param name Name of the Gauge
      * @param val The value to set
      * @param tags The tags to Query/Group the results
      * @param description The Description of the Gauge ( Used only the first time ) 
      */
     gauge(name: string, val: number, tags?: any, description?: string): any;
}

type LabelValues = {
     [key: string]: string | number
}

@injectable()
export class PrometheusMetricCollector implements MetricCollectorInterface {
     
     counters: Map<string, PromClient.Counter>;
     histograms: Map<string, PromClient.Histogram>;
     gauges: Map<string, PromClient.Gauge>;

     constructor() {
          this.counters = new Map<string, PromClient.Counter>();
          this.histograms = new Map<string, PromClient.Histogram>();
          this.gauges = new Map<string, PromClient.Gauge>();
          // Collect Default Metrices
          this.collectDefaultMetrices();
     }

     register(app: Application): Application {
          app.get('/metrics', (req, res) => {
               res.set('Content-Type', PromClient.register.contentType);
               res.end(PromClient.register.metrics());
          });

          return app;
     }

     collectDefaultMetrices() {
          PromClient.collectDefaultMetrics({timeout: 5000});
     }
     
     createCounter(name: string, tags: string[], description?: string) {
          if ( ! description ) {
               description = name;
          }
          this.counters.set(name, new PromClient.Counter({
               name,
               labelNames: tags,
               help: description
          }));
     }

     resetCounter(name: string): void {
          this.counters.get(name)?.remove();
     }

     incrementCounter(name: string, tags?: LabelValues, description?: string) {
          if ( ! this.counters.has(name) ) {
               this.createCounter(name, Object.keys(tags || {}), description);
          }

          this.counters.get(name).inc(tags);
     }
     

     createHistogram(name: string, tags?: string[], description?: string)  {
          this.histograms.set(name, new PromClient.Histogram({
               name,
               labelNames: tags,
               help: description ?? name,
               buckets: [1, 50, 100, 250, 500, 700]
          }));
     }
     
     histogram(name: string, val: number, tags?: LabelValues) {
          if ( ! this.histograms.has(name) ) {
               this.createHistogram(name, Object.keys(tags || {}));
          }

          if ( tags )
               this.histograms.get(name).observe(tags, val);
          else 
               this.histograms.get(name).observe(val);
     }

     createGauge(name: string, tags?: string[], description?: string) {
          this.gauges.set(name, new PromClient.Gauge({
               name,
               labelNames: tags,
               help: description ?? name
          }))
     }
     
     
     gauge(name: string, val: number, tags?: LabelValues) {
          if ( ! this.gauges.has(name) ) {
               this.createGauge(name, Object.keys(tags || {}));
          }

          this.gauges.get(name).set(tags, val);
     }
} 