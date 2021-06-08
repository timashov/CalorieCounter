export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    USER = 'user',
    NONE = 'none'
}

export class UserRoleManager {
    static allUserRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER];
}