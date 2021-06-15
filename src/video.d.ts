import '@videojs/themes/dist/sea/index.css';
import 'videojs-youtube';
export declare function showDefaultVideo(): void;
export declare function setPause(value: boolean): Promise<void>;
export declare function seekTo(seconds: number): Promise<void>;
export declare function setSource(sourceURL: string): void;
