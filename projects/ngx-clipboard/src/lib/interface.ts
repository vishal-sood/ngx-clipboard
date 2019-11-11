export interface IClipboardResponse {
    isSuccess: boolean;
    content?: string;
    htmlContent?: string;
    event: Event;
    successMessage?: string;
}

export interface CopySources {
    source: string | HTMLElement;
    htmlSource?: string | HTMLElement;
    useAsCommonSource?: boolean;
}
