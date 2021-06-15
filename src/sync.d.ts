import * as firebase from 'firebase/app';
export declare function sendVideoSource(sourceURL: string): void;
export declare function sendVideoState(paused: boolean, position: number): void;
export declare function listenRoom(roomRef: firebase.database.Reference): void;
export declare var eventCooldown: boolean;
