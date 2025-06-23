import {type FC, useMemo} from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import moment from 'moment';
import type { ClimateMetric } from '../types';

interface ClimateMetricsChartProps {
    city: string;
    data: ClimateMetric[];
}

export const ClimateMetricsChart: FC<ClimateMetricsChartProps> = ({ city, data }) => {
    const seriesData = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }

        return [{
            name: 'Temperature',
            data: data.map(d => ({
                x: moment(d.timestamp).valueOf(),
                y: [Number(d.open), Number(d.high), Number(d.low), Number(d.close)] as [number, number, number, number],
            })),
        }];
    }, [data])

    const options: ApexOptions = {
        chart: {
            type: 'candlestick',
                height: 290,
                id: 'candles',
                toolbar: {
                autoSelected: 'pan',
                    show: false
            },
            zoom: {
                enabled: false
            },
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#3C90EB',
                        downward: '#DF7D46'
                }
            }
        },
        xaxis: {
            type: 'datetime'
        }
    }


    return (
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg w-full max-w-4xl mt-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {`Candlestick Temperature Chart for ${city}`}
            </h2>
            {seriesData.length ? (
                <ReactApexChart options={options} series={seriesData} type="candlestick" height={290} />
            ) : (
                <p className="text-center text-gray-500 text-lg">No valid data to display the chart.</p>
            )}
        </div>
    );
}
