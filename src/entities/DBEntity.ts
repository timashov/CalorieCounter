import {Column, PrimaryGeneratedColumn, BaseEntity, Timestamp} from "typeorm";

export class DBEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column({
        nullable: false,
        select: false,
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP"
    })
    updatedAt?: Timestamp;

    @Column({
        nullable: false,
        select: false,
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP",
        update: false
    })
    createdAt?: Timestamp;

    constructor() {
        super();
    }
}