import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    dotenv.config({ path: ".env" });
}

if (!process.env.JWT_SECRET_KEY){
    throw new Error('JWT_SECRET_KEY must be defined');
}

if (!process.env.JWT_REFRESH_TOKEN_SECRET_KEY){
    throw new Error('JWT_REFRESH_TOKEN_SECRET_KEY must be defined');
}

if (!process.env.JWT_ALGORITHM){
    throw new Error('JWT_ALGORITHM must be defined');
}

if (!process.env.JWT_TOKEN_EXPIRATION_TIME){
    throw new Error('JWT_TOKEN_EXPIRATION_TIME must be defined');
}

if (!process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME){
    throw new Error('JWT_REFRESH_TOKEN_EXPIRATION_TIME must be defined');
}

if (!process.env.NUTRITIONIX_APP_ID){
    throw new Error('NUTRITIONIX_APP_ID must be defined');
}

if (!process.env.NUTRITIONIX_APP_KEY){
    throw new Error('NUTRITIONIX_APP_KEY must be defined');
}