import axios from "axios";

interface Food {
    nf_calories: number;
}

export class CaloriesManager {

    static async getCaloriesCount(foodName: string): Promise<number> {
        try {
            const { data } = await axios({
                url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
                method: 'post',
                headers: {
                    'x-app-id': process.env.NUTRITIONIX_APP_ID,
                    'x-app-key': process.env.NUTRITIONIX_APP_KEY,
                    'x-remote-user-id': 0
                },
                data: {
                    query: foodName
                }
            });

            const foodsData = data as { foods: Food[] };
            if (foodsData && foodsData.foods && foodsData.foods.length>0){
                return foodsData.foods[0].nf_calories;
            }    
        } catch (error) {
        }

        return 0;
    }

}