import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { IClipboardResponse } from './interface';
import { ClipboardModule } from './ngx-clipboard.module';
import { ClipboardService } from './ngx-clipboard.service';

/*
 * Shell component with property 'text' that will be used with our tests
 */
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'test-clipboard',
    template: `
        <span>PlaceHolder HTML to be Replaced</span>
    `
})
export class TestClipboardComponent {
    public text = 'test';
    public html = '<h4>test</h4>';
    public isCopied: boolean;
    public copySuccessMsg = 'Foo bar';
}

/**
 * Helper function to easily build a component Fixture using the specified template
 * From: https://blog.thoughtram.io/angular/2016/12/27/angular-2-advance-testing-with-custom-matchers.html
 */
function createTestComponent(template: string): ComponentFixture<TestClipboardComponent> {
    return TestBed.overrideComponent(TestClipboardComponent, {
        set: { template }
    }).createComponent(TestClipboardComponent);
}

describe('Directive: clipboard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestClipboardComponent],
            imports: [BrowserModule, ClipboardModule, FormsModule],
            providers: [ClipboardService]
        });
    });

    describe('copy when cbTextContent is set', () => {
        let template: string;
        let fixture: ComponentFixture<TestClipboardComponent>;
        let clipboardService: ClipboardService;
        let spy: jasmine.Spy;
        let button: HTMLButtonElement;
        beforeEach(() => {
            template = `<button ngxClipboard [cbTextContent]="'text'" (cbOnSuccess)="isCopied = true" [cbSuccessMsg]="copySuccessMsg">copy</button>`;
            fixture = createTestComponent(template);
            clipboardService = fixture.debugElement.injector.get(ClipboardService);
            // Setup spy on the `copyFromSource` method, somehow document.execCommand('copy') doesn't work in Karma
            spy = spyOn(clipboardService, 'copyFromSource' as keyof (ClipboardService));
            fixture.detectChanges();
            button = fixture.debugElement.nativeElement.querySelector('button');
        });

        it('should fire cbOnError if environment does not support copy', async(() => {
            spy = spyOn(clipboardService, 'isSupported');
            spy.and.returnValue(false);
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should fire cbOnSuccess after copy successfully', async(() => {
            spy.and.returnValue(true);
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeTruthy();
            });
        }));

        it('should fire cbOnError after copy fail', async(() => {
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should push copy response to copySubject', async(() => {
            button.click();
            const component = fixture.componentInstance;
            clipboardService.copyResponse$.subscribe((res: IClipboardResponse) => {
                expect(res).toBeDefined();
                expect(res.isSuccess).toEqual(true);
                expect(res.content).toEqual(component.text);
                expect(res.successMessage).toEqual(component.copySuccessMsg);
                expect(res.event).toBeDefined();
            });
        }));
    });

    describe('copy when targetTextElement is set', () => {
        let template: string;
        let fixture: ComponentFixture<TestClipboardComponent>;
        let clipboardService: ClipboardService;
        let spy: jasmine.Spy;
        let button: HTMLButtonElement;
        let input: HTMLInputElement;
        beforeEach(() => {
            template = `<input type="text" [(ngModel)]="text"  #inputTarget>
            <button type="button" ngxClipboard [targetTextElement]="inputTarget" (cbOnSuccess)="isCopied = true">copy</button>`;
            fixture = createTestComponent(template);
            clipboardService = fixture.debugElement.injector.get(ClipboardService);
            // Setup spy on the `copyFromSource` method, somehow document.execCommand('copy') doesn't work in Karma
            spy = spyOn(clipboardService, 'copyFromSource' as keyof (ClipboardService));
            fixture.detectChanges();
            button = fixture.debugElement.nativeElement.querySelector('button');
            input = fixture.debugElement.nativeElement.querySelector('input');
            // input 'new test'
            input.value = 'new test';
            input.dispatchEvent(new Event('input'));
        });

        it('should fire cbOnSuccess after copy successfully', async(() => {
            spy.and.returnValue(true);
            fixture.detectChanges();
            // button click to trigger copy
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeTruthy();
            });
        }));

        it('should fire cbOnError if environment does not support copy', async(() => {
            spy = spyOn(clipboardService, 'isSupported');
            spy.and.returnValue(false);
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should fire cbOnError after copy fail', async(() => {
            spy.and.returnValue(false);
            fixture.detectChanges();
            // button click to trigger copy
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should push copy response to copySubject', async(() => {
            button.click();
            const component = fixture.componentInstance;
            clipboardService.copyResponse$.subscribe((res: IClipboardResponse) => {
                expect(res).toBeDefined();
                expect(res.isSuccess).toEqual(true);
                expect(res.content).toEqual(component.text);
                expect(res.successMessage).toEqual(component.copySuccessMsg);
                expect(res.event).toBeDefined();
            });
        }));
    });

    describe('copy when cbHTMLContent is set', () => {
        let template: string;
        let fixture: ComponentFixture<TestClipboardComponent>;
        let clipboardService: ClipboardService;
        let spy: jasmine.Spy;
        let button: HTMLButtonElement;
        beforeEach(() => {
            template = `<button ngxClipboard [cbHTMLContent]="'html'" (cbOnSuccess)="isCopied = true" [cbSuccessMsg]="copySuccessMsg">copy</button>`;
            fixture = createTestComponent(template);
            clipboardService = fixture.debugElement.injector.get(ClipboardService);
            // Setup spy on the `copyFromSource` method, somehow document.execCommand('copy') doesn't work in Karma
            spy = spyOn(clipboardService, 'copyFromSource' as keyof (ClipboardService));
            fixture.detectChanges();
            button = fixture.debugElement.nativeElement.querySelector('button');
        });

        it('should fire cbOnError if environment does not support copy', async(() => {
            spy = spyOn(clipboardService, 'isSupported');
            spy.and.returnValue(false);
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should fire cbOnSuccess after copy successfully', async(() => {
            spy.and.returnValue(true);
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeTruthy();
            });
        }));

        it('should fire cbOnError after copy fail', async(() => {
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should push copy response to copySubject', async(() => {
            button.click();
            const component = fixture.componentInstance;
            clipboardService.copyResponse$.subscribe((res: IClipboardResponse) => {
                expect(res).toBeDefined();
                expect(res.isSuccess).toEqual(true);
                expect(res.htmlContent).toEqual(component.html);
                expect(res.successMessage).toEqual(component.copySuccessMsg);
                expect(res.event).toBeDefined();
            });
        }));
    });

    describe('copy when targetHTMLElement is set', () => {
        let inputElement: string;
        let template: string;
        let fixture: ComponentFixture<TestClipboardComponent>;
        let clipboardService: ClipboardService;
        let spy: jasmine.Spy;
        let spyx: jasmine.Spy;
        let button: HTMLButtonElement;
        let input: HTMLInputElement;
        beforeEach(() => {
            inputElement = `<input type="text" [(ngModel)]="text"  #inputTarget>`;
            template = `${inputElement}
            <button type="button" ngxClipboard [targetHTMLElement]="inputTarget" (cbOnSuccess)="isCopied = true">copy</button>`;
            fixture = createTestComponent(template);
            clipboardService = fixture.debugElement.injector.get(ClipboardService);
            // Setup spy on the `copyFromSource` method, somehow document.execCommand('copy') doesn't work in Karma
            spy = spyOn(clipboardService, 'copyFromSource' as keyof (ClipboardService));
            fixture.detectChanges();
            button = fixture.debugElement.nativeElement.querySelector('button');
            input = fixture.debugElement.nativeElement.querySelector('input');
            // input 'new test'
            input.value = 'new test';
            input.dispatchEvent(new Event('input'));
        });

        it('should fire cbOnSuccess after copy successfully', async(() => {
            spy.and.returnValue(true);
            fixture.detectChanges();
            // button click to trigger copy
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeTruthy();
            });
        }));

        it('should fire cbOnError if environment does not support copy', async(() => {
            spy = spyOn(clipboardService, 'isSupported');
            spy.and.returnValue(false);
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should fire cbOnError after copy fail', async(() => {
            spy.and.returnValue(false);
            fixture.detectChanges();
            // button click to trigger copy
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should push copy response to copySubject', async(() => {
            spyx = spyOn(clipboardService, 'pushCopyReponse' as keyof (ClipboardService));
            button.click();
            const component = fixture.componentInstance;
            expect(spyx).toHaveBeenCalled();
            clipboardService.copyResponse$.subscribe((res: IClipboardResponse) => {
                expect(res).not.toBeDefined();
                expect(res.isSuccess).toEqual(true);
                expect(res.htmlContent).toEqual(inputElement);
                expect(res.successMessage).toEqual(component.copySuccessMsg);
                expect(res.event).toBeDefined();
            });
        }));
    });

    describe('copy when commonTargetElement is set', () => {
        let inputElement: string;
        let template: string;
        let fixture: ComponentFixture<TestClipboardComponent>;
        let clipboardService: ClipboardService;
        let spy: jasmine.Spy;
        let button: HTMLButtonElement;
        let input: HTMLInputElement;
        beforeEach(() => {
            inputElement = `<input type="text" [(ngModel)]="text"  #inputTarget>`;
            template = `${inputElement}
            <button type="button" [ngxClipboard]="inputTarget" (cbOnSuccess)="isCopied = true">copy</button>`;
            fixture = createTestComponent(template);
            clipboardService = fixture.debugElement.injector.get(ClipboardService);
            // Setup spy on the `copyFromSource` method, somehow document.execCommand('copy') doesn't work in Karma
            spy = spyOn(clipboardService, 'copyFromSource' as keyof (ClipboardService));
            fixture.detectChanges();
            button = fixture.debugElement.nativeElement.querySelector('button');
            input = fixture.debugElement.nativeElement.querySelector('input');
            // input 'new test'
            input.value = 'new test';
            input.dispatchEvent(new Event('input'));
        });

        it('should fire cbOnSuccess after copy successfully', async(() => {
            spy.and.returnValue(true);
            fixture.detectChanges();
            // button click to trigger copy
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeTruthy();
            });
        }));

        it('should fire cbOnError if environment does not support copy', async(() => {
            spy = spyOn(clipboardService, 'isSupported');
            spy.and.returnValue(false);
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should fire cbOnError after copy fail', async(() => {
            spy.and.returnValue(false);
            fixture.detectChanges();
            // button click to trigger copy
            button.click();
            fixture.whenStable().then(() => {
                expect(fixture.componentInstance.isCopied).toBeFalsy();
            });
        }));

        it('should push copy response to copySubject', async(() => {
            button.click();
            const component = fixture.componentInstance;
            clipboardService.copyResponse$.subscribe((res: IClipboardResponse) => {
                expect(res).toBeDefined();
                expect(res.isSuccess).toEqual(true);
                expect(res.content).toEqual(component.text);
                expect(res.htmlContent).toEqual(inputElement);
                expect(res.successMessage).toEqual(component.copySuccessMsg);
                expect(res.event).toBeDefined();
            });
        }));
    });
});
