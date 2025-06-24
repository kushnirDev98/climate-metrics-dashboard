import moment from 'moment';
import { ILogger } from '../../services/Logger.service';
import { ClimateEvent, ClimateMetric } from './ClimateMetric.types';

export class ClimateMetricAggregatorService {
    private storage: Map<string, Map<string, ClimateMetric>> = new Map();

    constructor(private logger: ILogger) {}

    processEvent(event: ClimateEvent) {
        this.logger.info('Processing event', event);

        try {
            const { city, temperature, timestamp } = event;

            if (!city || typeof city !== 'string') {
                throw new Error('Invalid or missing city');
            }
            if (typeof temperature !== 'number' || isNaN(temperature) || temperature < -50 || temperature > 60) {
                throw new Error('Invalid temperature');
            }
            if (!moment(timestamp).isValid()) {
                throw new Error('Invalid timestamp');
            }

            const hour = moment(timestamp).utc().startOf('hour').toISOString();

            let cityCandles = this.storage.get(city);
            if (!cityCandles) {
                cityCandles = new Map<string, ClimateMetric>();
                this.storage.set(city, cityCandles);
            }

            let candle = cityCandles.get(hour);
            if (!candle) {
                candle = {
                    open: temperature,
                    high: temperature,
                    low: temperature,
                    close: temperature,
                    timestamp: hour,
                };
                cityCandles.set(hour, candle);
                this.logger.info(`Created new candle for ${city} at ${hour}`, candle);
            } else {
                candle.high = Math.max(candle.high, temperature);
                candle.low = Math.min(candle.low, temperature);
                candle.close = temperature;
                this.logger.info(`Updated candle for ${city} at ${hour}`, candle);
            }
        } catch (err: unknown) {
            this.logger.error('Failed to process event', {
                error: err instanceof Error ? err.message : String(err),
                event,
            });
        }
    }

    getCandlesticksByCity(city: string): ClimateMetric[] {
        if (!city || typeof city !== 'string') {
            this.logger.warn('Invalid city parameter', { city });
            return [];
        }

        const cityCandles = this.storage.get(city);

        if (!cityCandles) {
            this.logger.warn('No candlesticks found for city', { city });
            return [];
        }

        this.logger.info('Fetching candlesticks for city', { city });

        const results: ClimateMetric[] = Array.from(cityCandles.values());

        return results.sort((a, b) => moment(a.timestamp).diff(b.timestamp));
    }
}
