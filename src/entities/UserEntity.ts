import {Entity, Column, BeforeInsert, BaseEntity, Timestamp, Index} from "typeorm";
import { UserRole } from "../models/UserRole";
import { PasswordManager } from "../services/PasswordManager";
import { DBEntity } from "./DBEntity";

@Entity({
    name: 'Users'
})
export class UserEntity extends DBEntity {

    @Column({
        nullable: true,
        default: null,
        length: 256
    })
    @Index()
    name?: string;
        
    @Column({
        nullable: true,
        default: null,
        length: 128
    })
    @Index()
    email?: string;

    @Column({
        nullable: true,
        default: null,
        length: 1024
    })
    password?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    @Index()
    role: UserRole = UserRole.NONE;

    @Column('double', {
        default: 0
    })
    @Index()
    dailyCaloriesCount?: number;

    @BeforeInsert()
    async beforeInsert() {
        if (this.password){
            this.password = await PasswordManager.toHash(this.password);
        }
    }

    constructor() {
        super();
    }

    toJSON() {
        return { id: this.id, email: this.email, name: this.name, role: this.role, createdAt: this.createdAt, dailyCaloriesCount: this.dailyCaloriesCount }
    }

}