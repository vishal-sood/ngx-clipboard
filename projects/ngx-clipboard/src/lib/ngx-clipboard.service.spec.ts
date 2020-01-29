import { inject, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';

import { ClipboardService } from './ngx-clipboard.service';

describe('Service: Clipboard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BrowserModule]
        });
    });

    it('should service work', inject([ClipboardService], (service: ClipboardService) => {
        expect(service).toBeTruthy();
    }));

    it('it is supported', inject([ClipboardService], (service: ClipboardService) => {
        expect(service.isSupported).toBeTruthy();
    }));
});
