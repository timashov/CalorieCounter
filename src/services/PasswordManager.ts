import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class PasswordManager {
    static async toHash(password: string) {
        const salt = randomBytes(8).toString('hex');
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;

        return `${buf.toString('hex')}.${salt}`
    }

    static async compare(savedPassword: string, currentPassword: string) {
        const [hashedPassword, salt] = savedPassword.split('.');
        const buf = (await scryptAsync(currentPassword, salt, 64)) as Buffer;

        return buf.toString('hex') === hashedPassword;
    }
}