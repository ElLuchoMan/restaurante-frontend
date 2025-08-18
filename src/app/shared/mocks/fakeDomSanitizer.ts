import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeHtml, SafeStyle, SafeScript, SafeUrl } from '@angular/platform-browser';

@Injectable()
export class FakeDomSanitizer extends DomSanitizer {
    bypassSecurityTrustResourceUrl(url: string): SafeResourceUrl {
        return { toString: () => url, changingThisBreaksApplicationSecurity: url } as unknown as SafeResourceUrl;
    }
    sanitize(context: unknown, value: SafeResourceUrl | string | null): string | null {
        if (!value) { return null; }
        return value.toString();
    }
    bypassSecurityTrustHtml(value: string): SafeHtml {
        return value as unknown as SafeHtml;
    }
    bypassSecurityTrustStyle(value: string): SafeStyle {
        return value as unknown as SafeStyle;
    }
    bypassSecurityTrustScript(value: string): SafeScript {
        return value as unknown as SafeScript;
    }
    bypassSecurityTrustUrl(value: string): SafeUrl {
        return value as unknown as SafeUrl;
    }
}
