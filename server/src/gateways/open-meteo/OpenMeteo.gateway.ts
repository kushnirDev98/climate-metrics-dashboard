import WebSocket from 'ws';
import { ILogger } from '../../services/Logger.service';
import { ConfigService } from '../../services/Config.service';
import { ClimateEventSchema } from '../../modules/climateMetric/ClimateMetric.types';
import { ClimateMetricService } from '../../modules/climateMetric/ClimateMetric.service';

export class OpenMeteoGateway {
    private ws: WebSocket | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isClosing = false;

    constructor(
        private logger: ILogger,
        private configService: ConfigService,
        private climateMetricService: ClimateMetricService,
    ) {}

    connect() {
        const url = this.configService.get('OPEN_METEO_URL');
        this.logger.info('Connecting to WebSocket', { url });
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
            this.logger.info('WebSocket connected');
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
        });

        this.ws.on('message', (data) => {
            try {
                const rawEvent = JSON.parse(data.toString());
                const parsed = ClimateEventSchema.safeParse(rawEvent);

                if (parsed.success) {
                    this.climateMetricService.processEvent(parsed.data);
                } else {
                    this.logger.warn('Invalid WebSocket event', { event: rawEvent, errors: parsed.error.flatten() });
                }
            } catch (err: unknown) {
                this.logger.error('Failed to parse WebSocket message', {
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        });

        this.ws.on('error', (err) => {
            this.logger.error('WebSocket error', { error: err.message });
        });

        this.ws.on('close', () => {
            if (!this.isClosing && !this.reconnectTimeout) {
                this.logger.warn('WebSocket disconnected, reconnecting in 5s');
                this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
            }
        });
    }

    disconnect() {
        this.isClosing = true;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.logger.info('WebSocket disconnected');
        }
    }
}