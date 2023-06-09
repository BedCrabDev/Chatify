import { Socket } from "npm:socket.io";

declare type User = {
    id: string;
    created: Date;
    handle: string;
    displayName: string;
}

declare interface SelfUser extends User {
    handleLastUpdated: Date;
    email: string;
}

declare interface ChatifySocket extends Socket {
    self?: SelfUser;
}
