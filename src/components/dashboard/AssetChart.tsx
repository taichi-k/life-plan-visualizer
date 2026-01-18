'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Line,
    ComposedChart
} from 'recharts';
import { YearlyResult } from '../../lib/types';

interface AssetChartProps {
    data: YearlyResult[];
}

export const AssetChart: React.FC<AssetChartProps> = ({ data }) => {
    // データが空の場合
    if (!data || data.length === 0) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                データがありません
            </div>
        );
    }

    // プラスとマイナスのデータを分離（小数をカット）
    const chartData = data.map(d => ({
        year: d.year,
        totalAssets: Math.floor(d.totalAssets),
        positiveAssets: d.totalAssets >= 0 ? Math.floor(d.totalAssets) : 0,
        negativeAssets: d.totalAssets < 0 ? Math.floor(d.totalAssets) : 0,
    }));

    const hasNegative = data.some(d => d.totalAssets < 0);
    const maxAsset = Math.max(...data.map(d => d.totalAssets));
    const minAsset = Math.min(...data.map(d => d.totalAssets));

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* サマリー表示 */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '12px',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.02)',
                borderRadius: '8px',
                fontSize: '13px'
            }}>
                <div>
                    <span style={{ color: '#888' }}>最大資産: </span>
                    <span style={{ color: '#0984e3', fontWeight: 600 }}>{Math.floor(maxAsset).toLocaleString()}円</span>
                </div>
                <div>
                    <span style={{ color: '#888' }}>最小資産: </span>
                    <span style={{ color: minAsset < 0 ? '#d63031' : '#0984e3', fontWeight: 600 }}>
                        {Math.floor(minAsset).toLocaleString()}円
                    </span>
                </div>
                {hasNegative && (
                    <div style={{ color: '#d63031', fontWeight: 600 }}>
                        ⚠️ 資産がマイナスになる期間があります
                    </div>
                )}
            </div>

            <div style={{ flex: 1, width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0984e3" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0984e3" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d63031" stopOpacity={0.05} />
                                <stop offset="95%" stopColor="#d63031" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f5f5f5" vertical={false} />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 11, fill: '#888' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#888' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                        />
                        <Tooltip
                            formatter={(value: number | undefined) => [
                                value !== undefined ? `${Math.floor(value).toLocaleString()}円` : '0円',
                                '総資産'
                            ]}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                            labelFormatter={(label) => `${label}年`}
                        />
                        <ReferenceLine y={0} stroke="#666" strokeOpacity={0.3} strokeDasharray="3 3" />

                        {/* プラス領域（青） */}
                        <Area
                            type="monotone"
                            dataKey="positiveAssets"
                            stroke="transparent"
                            fill="url(#colorPositive)"
                            fillOpacity={1}
                        />

                        {/* マイナス領域（赤） */}
                        <Area
                            type="monotone"
                            dataKey="negativeAssets"
                            stroke="transparent"
                            fill="url(#colorNegative)"
                            fillOpacity={1}
                        />

                        {/* 折れ線グラフ */}
                        <Line
                            type="monotone"
                            dataKey="totalAssets"
                            stroke="#0984e3"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: '#0984e3' }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
