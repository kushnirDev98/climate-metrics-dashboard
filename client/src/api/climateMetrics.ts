import type { ClimateMetric } from '../types';
import { API_URL } from '../config';
import moment from "moment";

export async function fetchClimateMetrics(
    city: string,
    startTime: string,
    endTime: string,
    authToken: string | null
): Promise<ClimateMetric[]> {
    if (!city || !startTime || !endTime) {
        throw new Error('City, startTime, and endTime are required');
    }

    const startISO = moment(startTime).toISOString();
    const endISO = moment(endTime).toISOString();

    const url = `${API_URL}/climate-metrics/${city}?startTime=${startISO}&endTime=${endISO}`;

    const response = await fetch(url, {
        headers: {
            Authorization: authToken ? `Bearer ${authToken}` : '',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }

    const data: ClimateMetric[] = await response.json();
    return data;
}
