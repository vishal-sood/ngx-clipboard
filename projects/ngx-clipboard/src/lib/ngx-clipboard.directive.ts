import { Directive, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

import { IClipboardResponse, CopySources } from './interface';
import { ClipboardService } from './ngx-clipboard.service';

@Directive({
    selector: '[ngxClipboard]'
})
export class ClipboardDirective implements OnInit {
    // tslint:disable-next-line:no-input-rename
    @Input('ngxClipboard')
    public commonTargetElement: string | HTMLElement;

    @Input()
    public targetTextElement: HTMLElement;
    @Input()
    public targetHTMLElement: HTMLElement;

    @Input()
    public cbTextContent: string;
    @Input()
    public cbHTMLContent: string;

    @Input()
    public cbSuccessMsg: string;

    @Output()
    public cbOnSuccess: EventEmitter<IClipboardResponse> = new EventEmitter<IClipboardResponse>();

    @Output()
    public cbOnError: EventEmitter<any> = new EventEmitter<any>();
    constructor(private clipboardSrv: ClipboardService) {}

    // tslint:disable-next-line:no-empty
    public ngOnInit() {}

    @HostListener('click', ['$event.target'])
    public onClick(event: Event) {
        if (!this.clipboardSrv.isSupported) {
            this.handleResult(false, undefined, undefined, event);
            return;
        }

        let textContent: string, htmlContent: string;
        let copySource: CopySources = { source: undefined };
        if (this.commonTargetElement) {
            if (typeof this.commonTargetElement === 'string') {
                textContent = this.clipboardSrv.extractTextFromHTMLString(this.commonTargetElement);
                htmlContent = this.commonTargetElement;
            } else {
                textContent =
                    this.commonTargetElement instanceof HTMLInputElement
                        ? this.commonTargetElement.value
                        : this.commonTargetElement.innerText;
                htmlContent = this.commonTargetElement.outerHTML;
            }

            copySource.source = this.commonTargetElement;
            copySource.useAsCommonSource = true;
        } else {
            if (this.targetTextElement) {
                textContent =
                    this.targetTextElement instanceof HTMLInputElement
                        ? this.targetTextElement.value
                        : this.targetTextElement.innerText;
                copySource.source = this.targetTextElement;
            } else if (this.cbTextContent) {
                textContent = this.cbTextContent;
                copySource.source = this.cbTextContent;
            }

            if (this.targetHTMLElement) {
                htmlContent = this.targetHTMLElement.outerHTML;
                copySource.htmlSource = this.targetHTMLElement;
            } else if (this.cbHTMLContent) {
                htmlContent = this.cbHTMLContent;
                copySource.htmlSource = this.cbHTMLContent;
            }
        }

        if (textContent || htmlContent) {
            this.handleResult(this.clipboardSrv.copyFromSource(copySource), textContent, htmlContent, event);
        }
    }

    /**
     * Fires an event based on the copy operation result.
     * @param succeeded
     */
    private handleResult(
        succeeded: boolean,
        copiedContent: string | undefined,
        copiedHTMLContent: string | undefined,
        event: Event
    ) {
        let response: IClipboardResponse = {
            isSuccess: succeeded,
            event
        };

        if (succeeded) {
            response = Object.assign(response, {
                content: copiedContent,
                htmlContent: copiedHTMLContent,
                successMessage: this.cbSuccessMsg
            });

            this.cbOnSuccess.emit(response);
        } else {
            this.cbOnError.emit(response);
        }

        this.clipboardSrv.pushCopyReponse(response);
    }
}
