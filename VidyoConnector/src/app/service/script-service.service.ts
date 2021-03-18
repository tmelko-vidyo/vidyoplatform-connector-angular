import { Injectable } from '@angular/core';
import { ScriptStore } from './script-store';

/**
 * Service to load scrips dynamically, required after view is loaded.
 */
declare var document: any;
declare var VidyoClientLoaded: any;

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  private scripts: any = {};

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src,
        css: script.css,
      };
    });
  }

  load(...scripts: string[]) {
    var promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      //resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        //load script
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {
          //IE
          script.onreadystatechange = () => {
            if (
              script.readyState === 'loaded' ||
              script.readyState === 'complete'
            ) {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              this.attachCss(this.scripts[name]);
              resolve({ script: name, loaded: true, status: 'Loaded IE' });
            }
          };
        } else {
          //Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            this.attachCss(this.scripts[name]);
            resolve({ script: name, loaded: true, status: 'Loaded Other' });
          };
        }
        script.onerror = (error: any) =>
          resolve({ script: name, loaded: false, status: 'Loaded Error' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }

  attachCss(data: any) {
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = data.css;
    document.getElementsByTagName('head')[0].appendChild(style);

    console.log("Css Attached.");
  }
}
