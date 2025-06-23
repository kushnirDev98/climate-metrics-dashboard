import { z } from 'zod';

export const ClimateEventSchema = z.object({
    city: z.string(),
    timestamp: z.string().refine(
        (value) =>
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z)?$/.test(value),
        {
            message: 'Invalid ISO timestamp format',
        }
    ),
    temperature: z.number(),
    windspeed: z.number(),
    winddirection: z.number(),
});

export type ClimateEvent = z.infer<typeof ClimateEventSchema>;

export interface ClimateMetric {
    open: number;
    high: number;
    low: number;
    close: number;
    timestamp: string;
}
