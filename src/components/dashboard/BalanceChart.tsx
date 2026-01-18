'use client';

import React, { useState } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { YearlyResult } from '../../lib/types';

interface BalanceChartProps {
    data: YearlyResult[];
}

// 全ての支出カテゴリを定義
const EXPENSE_CATEGORIES = [
    { key: 'housing', name: '住居費', color: '#fdcb6e' },
    { key: 'tax', name: '税・社会保険', color: '#ff7675' },
    { key: 'education', name: '教育費', color: '#74b9ff' },
    { key: 'living', name: '生活費', color: '#00b894' },
    { key: 'utility', name: '光熱費', color: '#81ecec' },
    { key: 'communication', name: '通信費', color: '#a29bfe' },
    { key: 'medical', name: '医療費', color: '#fd79a8' },
    { key: 'insurance', name: '保険', color: '#fab1a0' },
    { key: 'car', name: '自動車', color: '#636e72' },
    { key: 'allowance', name: 'お小遣い', color: '#dfe6e9' },
    { key: 'event', name: 'イベント', color: '#6c5ce7' },
    { key: 'other', name: 'その他', color: '#b2bec3' },
];

export const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
    const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = { income: true };
        EXPENSE_CATEGORIES.forEach(cat => {
            initial[cat.key] = true;
        });
        return initial;
    });

    const toggleVisibility = (key: string) => {
        setVisibleItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // データを整形
    const chartData = data.map(d => {
        const row: Record<string, any> = {
            year: d.year,
            totalIncome: d.totalIncome,
        };
        EXPENSE_CATEGORIES.forEach(cat => {
            row[cat.key] = d.expenses[cat.key] || 0;
        });
        return row;
    });

    // データが空の場合
    if (!data || data.length === 0) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                データがありません
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* カスタムレジェンド（トグル可能） */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px',
                padding: '8px',
                background: 'rgba(0,0,0,0.02)',
                borderRadius: '8px'
            }}>
                <button
                    onClick={() => toggleVisibility('income')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        background: visibleItems.income ? 'rgba(9, 132, 227, 0.15)' : 'rgba(0,0,0,0.05)',
                        color: visibleItems.income ? '#0984e3' : '#999',
                        transition: 'all 0.2s',
                    }}
                >
                    <span style={{
                        width: '12px',
                        height: '3px',
                        background: visibleItems.income ? '#0984e3' : '#ccc',
                        borderRadius: '2px'
                    }} />
                    総収入
                </button>
                {EXPENSE_CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => toggleVisibility(cat.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            background: visibleItems[cat.key] ? `${cat.color}30` : 'rgba(0,0,0,0.05)',
                            color: visibleItems[cat.key] ? cat.color : '#999',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span style={{
                            width: '10px',
                            height: '10px',
                            background: visibleItems[cat.key] ? cat.color : '#ccc',
                            borderRadius: '2px'
                        }} />
                        {cat.name}
                    </button>
                ))}
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
                        <CartesianGrid stroke="#f5f5f5" vertical={false} />
                        <XAxis
                            dataKey="year"
                            scale="band"
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
                            formatter={(value, name) => {
                                const cat = EXPENSE_CATEGORIES.find(c => c.key === name);
                                const displayName = cat ? cat.name : (name === 'totalIncome' ? '総収入' : String(name));
                                return [typeof value === 'number' ? `${value.toLocaleString()}円` : '0円', displayName];
                            }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                            labelFormatter={(label) => `${label}年`}
                        />

                        {/* 支出カテゴリを積み上げ棒グラフで表示 */}
                        {EXPENSE_CATEGORIES.map((cat, index) => (
                            visibleItems[cat.key] && (
                                <Bar
                                    key={cat.key}
                                    dataKey={cat.key}
                                    stackId="expenses"
                                    fill={cat.color}
                                    name={cat.key}
                                    radius={index === EXPENSE_CATEGORIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                />
                            )
                        ))}

                        {/* 収入を折れ線グラフで表示 */}
                        {visibleItems.income && (
                            <Line
                                type="monotone"
                                dataKey="totalIncome"
                                stroke="#0984e3"
                                strokeWidth={3}
                                dot={false}
                                name="totalIncome"
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
