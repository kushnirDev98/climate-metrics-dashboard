import { ClimateMetricAggregatorService } from './ClimateMetricAggregator.service';
import { ILogger } from '../../services/Logger.service';
import { ClimateEvent } from './ClimateMetric.types';

export class ClimateMetricService {
    constructor(
        private logger: ILogger,
        private aggregator: ClimateMetricAggregatorService,
    ) {}

    processEvent(event: ClimateEvent) {
        this.logger.info('Processing climate event', { city: event.city, timestamp: event.timestamp });
        this.aggregator.processEvent(event);
    }

    getCandlesticks(city: string) {
        return this.aggregator.getCandlesticksByCity(city);
    }
}