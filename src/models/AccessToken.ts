import { UserRole } from "./UserRole";

export interface JWTAccessToken {
    accessToken: AccessToken;
}

export class AccessToken {
    userId: number;
    role: UserRole;

    constructor(userId: number, role: UserRole) {
        this.userId = userId;
        this.role = role;
    }

    serialize() {
        return [
            { userId: this.userId, role: this.role }
        ]
    }
}