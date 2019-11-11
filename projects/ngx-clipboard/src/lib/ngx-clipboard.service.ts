import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';
import { WINDOW } from 'ngx-window-token';
import { Observable, Subject } from 'rxjs';

import { IClipboardResponse, CopySources } from './interface';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
    private textContent: string | undefined;
    private htmlContent: string | undefined;

    private copySubject = new Subject<IClipboardResponse>();
    public copyResponse$: Observable<IClipboardResponse> = this.copySubject.asObservable();

    constructor(@Inject(DOCUMENT) public document: any, @Optional() @Inject(WINDOW) private window: any) {}

    private resetServiceContents(): void {
        this.textContent = undefined;
        this.htmlContent = undefined;
    }

    private setTextContentFromString(content: string): void {
        this.textContent = content;
    }

    private setHTMLContentFromString(content: string): void {
        this.htmlContent = content;
    }

    private setTextContentFromElement(element: HTMLElement): void {
        this.textContent = element instanceof HTMLInputElement ? element.value : element.innerText;
    }

    private setHTMLContentFromElement(element: HTMLElement): void {
        this.htmlContent = element.outerHTML;
    }

    public get isSupported(): boolean {
        return !!this.document.queryCommandSupported && !!this.document.queryCommandSupported('copy') && !!this.window;
    }

    private copyContent(): boolean {
        const customCopyHandler = function(event: ClipboardEvent): boolean {
            try {
                if (this.textContent) {
                    event.clipboardData.setData('text/plain', this.textContent);
                }
                if (this.htmlContent) {
                    event.clipboardData.setData('text/html', this.htmlContent);
                }

                event.preventDefault();
            } catch (error) {
                return false;
            }

            return true;
        };

        const boundCustomCopyHandler = customCopyHandler.bind(this);
        this.document.addEventListener('copy', boundCustomCopyHandler);
        const success = this.document.execCommand('copy');
        this.document.removeEventListener('copy', boundCustomCopyHandler);
        return success;
    }

    public copyFromContent(textContent: string, htmlContent?: string): boolean {
        try {
            return this.copyFromSource({
                source: textContent,
                htmlSource: htmlContent
            });
        } catch (error) {
            return false;
        }
    }

    public copyFromCommonContent(content: string): boolean {
        try {
            return this.copyFromSource({
                source: content,
                useAsCommonSource: true
            });
        } catch (error) {
            return false;
        }
    }

    public copyFromElement(textElement: HTMLElement, htmlElement?: HTMLElement): boolean {
        try {
            return this.copyFromSource({
                source: textElement,
                htmlSource: htmlElement
            });
        } catch (error) {
            return false;
        }
    }

    public copyFromCommonElement(element: HTMLElement): boolean {
        try {
            return this.copyFromSource({
                source: element,
                useAsCommonSource: true
            });
        } catch (error) {
            return false;
        }
    }

    extractTextFromHTMLString(htmlString: string): string {
        const tempElement: HTMLDivElement = <HTMLDivElement>this.document.createElement('div');
        tempElement.innerHTML = htmlString;

        return tempElement.innerText;
    }

    public copyFromSource(src: CopySources): boolean {
        if (src.useAsCommonSource === true) {
            try {
                if (typeof src.source === 'string') {
                    this.setHTMLContentFromString(src.source);
                    this.setTextContentFromString(this.extractTextFromHTMLString(src.source));
                } else {
                    this.setHTMLContentFromElement(src.source);
                    this.setTextContentFromElement(src.source);
                }
            } catch (error) {
                throw new Error('source should be either string or HTMLElement');
            }
        } else {
            if (src.source) {
                try {
                    if (typeof src.source === 'string') {
                        this.setTextContentFromString(src.source);
                    } else {
                        this.setTextContentFromElement(src.source);
                    }
                } catch (error) {
                    throw new Error('source should be either string or HTMLElement');
                }
            }

            if (src.htmlSource) {
                try {
                    if (typeof src.htmlSource === 'string') {
                        this.setHTMLContentFromString(src.htmlSource);
                    } else {
                        this.setHTMLContentFromElement(src.htmlSource);
                    }
                } catch (error) {
                    throw new Error('htmlSource should be either string or HTMLElement');
                }
            }
        }

        const success = this.copyContent();
        this.resetServiceContents();
        return success;
    }

    /**
     * Pushes copy operation response to copySubject, to provide global access
     * to the response.
     */
    public pushCopyReponse(response: IClipboardResponse) {
        this.copySubject.next(response);
    }
}
