import { Component } from '@angular/core';
// import { ClipboardService } from 'local-ngx-clipboard';

// import { ClipboardService } from 'ngx-clipboard';
import { ClipboardService, CopySources } from 'projects/ngx-clipboard/src/public_api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    text1: string;
    text2: string;
    html1 = '<strong>Hello <em>world</em></strong>';
    html2 = 'This <strong>HTML element</strong> itself will be copied after click the copy button';
    textModal: string;
    isCopied1: boolean;
    isCopied2: boolean;
    isCopied3: boolean;
    isCopied4: boolean;
    isCopied5: boolean;
    basic = false;
    constructor(private _clipboardService: ClipboardService) {}

    callServiceToCopy() {
        const paraElement = document.createElement('p');
        paraElement.innerHTML = 'The text source was a <strong>string</strong>, but this is an <em>HTML element</em>';
        const copySource: CopySources = {
            source: 'You can provide completely different sources for copying on different streams',
            htmlSource: paraElement
        };
        this._clipboardService.copyFromSource(copySource);
    }

    onCopyFailure() {
        alert('copy fail!');
    }
}
