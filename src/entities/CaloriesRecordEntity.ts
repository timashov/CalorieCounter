import { Entity, Column, Index } from "typeorm";
import { DBEntity } from "./DBEntity";

@Entity({
    name: 'CaloriesRecords'
})
export class CaloriesRecordEntity extends DBEntity {

    @Column()
    @Index()
    userId?: number;

    @Column({
        nullable: true,
        default: null,
        length: 10
    })
    @Index()
    date?: string;

    @Column({
        nullable: true,
        default: null,
        length: 8
    })
    @Index()
    time?: string;

    @Column({
        nullable: true,
        default: null,
        length: 256
    })
    @Index()
    text?: string;

    @Column('double', {
        default: 0
    })
    @Index()
    caloriesCount?: number;

    @Column('double', {
        default: 0
    })
    @Index()
    dayCaloriesCount?: number;

    @Column({
        default: false
    })
    @Index()
    lowerThanDailyCaloriesQuota?: boolean;

    constructor(userId: number, date: string, time: string, text: string, caloriesCount?: number) {
        super();

        this.userId = userId;
        this.date = date;
        this.time = time;
        this.text = text;

        if (caloriesCount != undefined){
            this.caloriesCount = caloriesCount;
        }
    }

    toJSON() {
        return { id: this.id, userId: this.userId, date: this.date, time: this.time, text: this.text, caloriesCount: this.caloriesCount, lowerThanDailyCaloriesQuota: this.lowerThanDailyCaloriesQuota }
    }

}