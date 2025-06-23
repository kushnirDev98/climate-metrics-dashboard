import { z } from 'zod';
import dotenv from 'dotenv';

const configSchema = z.object({
    PORT: z.string().transform(Number).refine((n) => n > 0, 'Invalid port'),
    OPEN_METEO_URL: z.string().url(),
    POLLING_INTERVAL_MS: z.string().transform(Number).refine((n) => n > 0).default('60000'),    CORS_ORIGIN: z.string().optional(),
    SIMULATOR_PORT: z.string().transform(Number).refine((n) => n > 0),
    SIMULATOR_INTERVAL_MS: z.string().transform(Number).refine((n) => n > 0),
});

type Config = z.infer<typeof configSchema>;
type ConfigKey = keyof Config;

export class ConfigService {
    private static instance: ConfigService | null = null;
    private config: Config;

    private constructor() {
        this.config = configSchema.parse(process.env);
    }

    public static initialize(): ConfigService {
        if (!ConfigService.instance) {
            dotenv.config();
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            throw new Error('ConfigService not initialized. Call ConfigService.initialize() first.');
        }
        return ConfigService.instance;
    }

    public get<T extends ConfigKey>(key: T): Config[T] {
        if (!(key in this.config)) {
            throw new Error(`Invalid config key: ${key}`);
        }
        return this.config[key];
    }
}