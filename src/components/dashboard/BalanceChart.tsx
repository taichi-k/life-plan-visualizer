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

    // データを整形（世帯主の年齢をX軸に使用）
    const chartData = data.map(d => {
        const row: Record<string, any> = {
            year: d.year,
            age: d.ageHusband ?? d.year, // 世帯主の年齢、なければ年を使用
            totalIncome: d.totalIncome,
            totalExpense: d.totalExpense,
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
                        background: visibleItems.income ? 'rgba(231, 76, 60, 0.15)' : 'rgba(0,0,0,0.05)',
                        color: visibleItems.income ? '#e74c3c' : '#999',
                        transition: 'all 0.2s',
                    }}
                >
                    <span style={{
                        width: '12px',
                        height: '3px',
                        background: visibleItems.income ? '#e74c3c' : '#ccc',
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

            <div style={{ flex: 1, width: '100%', height: 300, outline: 'none' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                        }}
                        style={{ outline: 'none' }}
                    >
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
                            formatter={(value, name) => {
                                const cat = EXPENSE_CATEGORIES.find(c => c.key === name);
                                const displayName = cat ? cat.name : (name === 'totalIncome' ? '総収入' : String(name));
                                return [typeof value === 'number' ? `${Math.round(value).toLocaleString()}円` : '0円', displayName];
                            }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length > 0) {
                                    const data = payload[0]?.payload;
                                    const totalExpense = Math.round(data?.totalExpense || 0);
                                    return (
                                        <div style={{ 
                                            background: 'white', 
                                            borderRadius: '12px', 
                                            padding: '12px 16px', 
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                                            minWidth: '160px'
                                        }}>
                                            <p style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>{label}歳（{data?.year}年）</p>
                                            <p style={{ margin: '4px 0', color: '#d63031', fontWeight: 600, fontSize: '13px' }}>
                                                📊 総費用: {totalExpense.toLocaleString()}円
                                            </p>
                                            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
                                            {payload.map((entry: any, index: number) => {
                                                const cat = EXPENSE_CATEGORIES.find(c => c.key === entry.dataKey);
                                                const displayName = cat ? cat.name : (entry.dataKey === 'totalIncome' ? '総収入' : entry.dataKey);
                                                const value = Math.round(entry.value || 0);
                                                if (value === 0) return null;
                                                return (
                                                    <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '12px' }}>
                                                        {displayName}: {value.toLocaleString()}円
                                                    </p>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return null;
                            }}
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
                                    barSize={40}
                                    radius={index === EXPENSE_CATEGORIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                />
                            )
                        ))}

                        {/* 収入を折れ線グラフで表示（ステップ型で各年水平に、中央揃え） */}
                        {visibleItems.income && (
                            <Line
                                type="step"
                                dataKey="totalIncome"
                                stroke="#e74c3c"
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
