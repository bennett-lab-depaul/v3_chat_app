import { ApexOptions } from "apexcharts";
import { useState } from "react";
import ReactApexChart from "react-apexcharts";

export default function CircularProgress( {score} : {score: number}) {
    const series = [score];
    const options: ApexOptions = {
        chart: {
            height: 350,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                startAngle: -100,
                endAngle: 100,
                track: {
                    background: '#fff',
                    margin: 0, // margin is in pixels
                },
                dataLabels: {
                    show: true,
                    name: {
                        offsetY: -10,
                        show: true,
                        color: '#888',
                        fontSize: '17px'
                    },
                    value: {
                        formatter: function(val: number) {
                            return val.toString();
                        },
                        color: '#111',
                        fontSize: '36px',
                        show: true,
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#0ac945'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                colorStops: [
                    {
                        offset: 0,
                        color: '#b0dfc1ff',
                        opacity: 1
                    },
                    {
                        offset: 30,
                        color: '#8ccda0ff',
                        opacity: 1
                    },
                    {
                        offset: 60,
                        color: '#61c880ff',
                        opacity: 1
                    },
                    {
                        offset: 90,
                        color: '#3dd26aff',
                        opacity: 1
                    },
                    {
                        offset: 150,
                        color: '#0ac945',
                        opacity: 1
                    },
                ]
            }
        },
        stroke: {
            lineCap: 'round'
        },
        labels: ['Total Score'],
    }

     return (
            <ReactApexChart options={options} series={series} type="radialBar" height={350} />
        );
    }