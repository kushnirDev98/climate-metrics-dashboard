import WebSocket from 'ws';
import { ConfigService } from '../services/Config.service';

export class WeatherStreamSimulator {
    private wss: WebSocket.Server;
    private cities: Record<string, [number, number]> = {
        Berlin: [52.52, 13.41],
        NewYork: [40.71, -74.01],
        Tokyo: [35.68, 139.69],
        SaoPaulo: [-23.55, -46.63],
        CapeTown: [-33.92, 18.42],
    };

    constructor(private configService: ConfigService) {
        const port = this.configService.get('SIMULATOR_PORT');
        this.wss = new WebSocket.Server({ port }, () => {
            console.log(`Open Meteo Simulator WebSocket server running at ws://localhost:${port}`);
        });
    }

    start() {
        this.wss.on('connection', (ws) => {
            console.log('🌐 Client connected');

            const interval = setInterval(async () => {
                const cityNames = Object.keys(this.cities);
                const city = cityNames[Math.floor(Math.random() * cityNames.length)];
                const [lat, lng] = this.cities[city];

                try {
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
                    );
                    const data = await response.json();
                    const weather = data.current_weather;

                    if (weather) {
                        const event = {
                            city,
                            timestamp: weather.time,
                            temperature: weather.temperature,
                            windspeed: weather.windspeed,
                            winddirection: weather.winddirection,
                        };
                        ws.send(JSON.stringify(event));
                    }
                } catch (err) {
                    console.error('Error fetching weather data:', err instanceof Error ? err.message : String(err));
                }
            }, this.configService.get('SIMULATOR_INTERVAL_MS'));

            ws.on('close', () => {
                console.log('🔌 Client disconnected');
                clearInterval(interval);
            });
        });
    }

    stop() {
        this.wss.close(() => {
            console.log('Open Meteo Simulator WebSocket server stopped');
        });
    }
}

// Bootstrapping the simulator
const config = ConfigService.initialize();
const simulator = new WeatherStreamSimulator(config);
simulator.start();

process.on('SIGINT', () => {
    simulator.stop();
    process.exit(0);
});
