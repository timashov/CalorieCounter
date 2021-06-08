import { getRepository } from "typeorm";
import { CaloriesRecordEntity } from "../entities/CaloriesRecordEntity";
import { UserEntity } from "../entities/UserEntity";

export class UsersManager {

    static async calculateUserDailyCalories(userId: number): Promise<number> {
        const { sum } = await getRepository(CaloriesRecordEntity)
            .createQueryBuilder("record")
            .select("SUM(record.caloriesCount)", "sum")
            .getRawOne(); 

        const { daysCount } = await getRepository(CaloriesRecordEntity)
            .createQueryBuilder("record")
            .select("COUNT(DISTINCT(record.date))", "daysCount")
            .getRawOne(); 

        const dailyCaloriesCount = (sum / daysCount) || 0;

        await UserEntity.update(userId, { dailyCaloriesCount: dailyCaloriesCount });

        return dailyCaloriesCount;
    }

}