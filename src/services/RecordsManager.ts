import { getRepository } from "typeorm";
import { CaloriesRecordEntity } from "../entities/CaloriesRecordEntity";

interface DateCalories {
    date: string;
    caloriesCount: number;
}

export class RecordsManager {

    static async calculateDailyCaloriesQuotaExcess(userId: number, dailyQouta: number): Promise<void> {
        await getRepository(CaloriesRecordEntity)
            .createQueryBuilder("record")
            .update()
            .set({ lowerThanDailyCaloriesQuota: true })
            .where(`userId = :userId`, { userId: userId })
            .where(`dayCaloriesCount < :dailyQouta`, { dailyQouta: dailyQouta })
            .execute();

        await getRepository(CaloriesRecordEntity)
            .createQueryBuilder("record")
            .update()
            .set({ lowerThanDailyCaloriesQuota: false })
            .where(`userId = :userId`, { userId: userId })
            .where(`dayCaloriesCount >= :dailyQouta`, { dailyQouta: dailyQouta })
            .execute();
    }

    static async updateDateCaloriesCount(userId: number, date: string): Promise<void> {
        const caloriesCount = await RecordsManager.getUserDateCalories(userId, date);

        await getRepository(CaloriesRecordEntity)
            .createQueryBuilder("record")
            .update()
            .set({ dayCaloriesCount: caloriesCount })
            .where(`userId = :userId`, { userId: userId })
            .andWhere(`date = :date`, { date: date })
            .execute();
    }

    static async getUserDateCalories(userId: number, date: string): Promise<number> {
        const { sum } = await getRepository(CaloriesRecordEntity)
            .createQueryBuilder("record")
            .select("SUM(record.caloriesCount)", "sum")
            .where(`record.userId = :userId`, { userId: userId })
            .andWhere(`record.date = :date`, { date: date })
            .getRawOne(); 

        return sum;
    }

}