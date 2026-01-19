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

    // プラスとマイナスのデータを分離（小数をカット、世帯主年齢をX軸に）
    const chartData = data.map((d) => {
        const currentAsset = Math.floor(d.totalAssets);
        
        return {
            year: d.year,
            age: d.ageHusband ?? d.year, // 世帯主の年齢、なければ年を使用
            totalAssets: currentAsset,
            positiveAssets: currentAsset >= 0 ? currentAsset : 0,
            negativeAssets: currentAsset < 0 ? currentAsset : 0,
            // プラスの折れ線: 0以上の時のみ表示
            positiveLineAssets: currentAsset >= 0 ? currentAsset : null,
            // マイナスの折れ線: 0未満の時のみ表示
            negativeLineAssets: currentAsset < 0 ? currentAsset : null,
        };
    });

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
                            dataKey="age"
                            tick={{ fontSize: 8, fill: '#888' }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
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
                            labelFormatter={(label, payload) => {
                                const year = payload?.[0]?.payload?.year;
                                return year ? `${label}歳（${year}年）` : `${label}歳`;
                            }}
                        />
                        <ReferenceLine y={0} stroke="#666" strokeOpacity={0.3} strokeDasharray="3 3" />

                        {/* プラス領域（青）- ステップ型 */}
                        <Area
                            type="step"
                            dataKey="positiveAssets"
                            stroke="transparent"
                            fill="url(#colorPositive)"
                            fillOpacity={1}
                        />

                        {/* マイナス領域（赤）- ステップ型 */}
                        <Area
                            type="step"
                            dataKey="negativeAssets"
                            stroke="transparent"
                            fill="url(#colorNegative)"
                            fillOpacity={1}
                        />

                        {/* プラスの折れ線グラフ（青）- ステップ型 */}
                        <Line
                            type="step"
                            dataKey="positiveLineAssets"
                            stroke="#0984e3"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: '#0984e3' }}
                            connectNulls={false}
                        />

                        {/* マイナスの折れ線グラフ（赤）- ステップ型 */}
                        <Line
                            type="step"
                            dataKey="negativeLineAssets"
                            stroke="#d63031"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: '#d63031' }}
                            connectNulls={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
