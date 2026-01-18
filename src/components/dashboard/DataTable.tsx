import React, { useState } from 'react';
import { YearlyResult } from '../../lib/types';
import { useAppStore } from '../../lib/store';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DataTableProps {
    data: YearlyResult[];
}

// 教育段階の表示名
const EDUCATION_STAGE_LABELS: Record<string, string> = {
    preschool: '未就学',
    kindergarten: '幼稚園',
    elementary: '小学校',
    middleSchool: '中学校',
    highSchool: '高校',
    university: '大学',
    graduated: '卒業'
};

type RowDef = {
    label: string;
    getValue: (d: YearlyResult) => string | number;
    category?: 'header' | 'income' | 'expense' | 'balance' | 'event' | 'age';
    indent?: boolean;
    subRows?: RowDef[];
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const { family } = useAppStore();
    const years = data.map(d => d.year);

    // 展開状態の管理
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        income: false,
        expense: false
    });

    const toggleExpand = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // 子供のメンバーをフィルタリング
    const children = family.filter(m => m.role === 'child');

    // 子供の行を動的に生成
    const childrenRows: RowDef[] = children.map((child, idx) => ({
        label: `${child.name || `子${idx + 1}`}`,
        getValue: (d: YearlyResult) => {
            const age = d.year - child.birthYear;
            const stage = d.childrenEducationStages?.[child.id];
            // 卒業後はラベルなし
            const stageLabel = (stage && stage !== 'graduated') ? EDUCATION_STAGE_LABELS[stage] || stage : '';
            if (age < 0) return '未誕生';
            return `${age}歳${stageLabel ? ` (${stageLabel})` : ''}`;
        },
        category: 'age' as const
    }));

    // メインのデータ行
    const mainRows: RowDef[] = [
        // 年齢セクション
        { label: '年齢 (夫)', getValue: (d: YearlyResult) => d.ageHusband != null ? `${d.ageHusband}歳` : '-', category: 'age' },
        { label: '年齢 (妻)', getValue: (d: YearlyResult) => d.ageWife != null ? `${d.ageWife}歳` : '-', category: 'age' },
        ...childrenRows,
        // 収入セクション（展開可能）
        {
            label: '📈 総収入',
            getValue: (d: YearlyResult) => formatMoney(d.totalIncome),
            category: 'income',
            subRows: [
                { label: '給与収入', getValue: (d: YearlyResult) => formatMoney(d.incomeBreakdown?.salary || 0), indent: true },
                { label: '年金収入', getValue: (d: YearlyResult) => formatMoney(d.incomeBreakdown?.pension || 0), indent: true },
                { label: '副業・その他', getValue: (d: YearlyResult) => formatMoney(d.incomeBreakdown?.other || 0), indent: true },
            ]
        },
        // 支出セクション（展開可能）
        {
            label: '📉 総支出',
            getValue: (d: YearlyResult) => formatMoney(d.totalExpense),
            category: 'expense',
            subRows: [
                { label: '住居費', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.housing || 0), indent: true },
                { label: '税金・社保', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.tax || 0), indent: true },
                { label: '教育費', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.education || 0), indent: true },
                { label: '生活費', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.living || 0), indent: true },
                { label: '光熱水費', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.utility || 0), indent: true },
                { label: '通信費', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.communication || 0), indent: true },
                { label: '医療費', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.medical || 0), indent: true },
                { label: '保険料', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.insurance || 0), indent: true },
                { label: '自動車関連', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.car || 0), indent: true },
                { label: 'お小遣い', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.allowance || 0), indent: true },
                { label: 'イベント支出', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.event || 0), indent: true },
                { label: 'その他', getValue: (d: YearlyResult) => formatMoney(d.expenseBreakdown?.other || 0), indent: true },
            ]
        },
        // 収支・資産
        { label: '💰 年間収支', getValue: (d: YearlyResult) => formatMoney(d.cashFlow), category: 'balance' },
        { label: '🏦 資産残高', getValue: (d: YearlyResult) => formatMoney(d.totalAssets), category: 'balance' },
        // イベント
        { label: '📅 イベント', getValue: (d: YearlyResult) => d.events.join(', ') || '-', category: 'event' }
    ];

    const getCellStyle = (category?: string, value?: number | string) => {
        const base: React.CSSProperties = {
            padding: '8px 12px',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            fontSize: '12px'
        };

        if (category === 'income') {
            return { ...base, color: '#0984e3', fontWeight: 600 };
        }
        if (category === 'expense') {
            return { ...base, color: '#d63031', fontWeight: 600 };
        }
        if (category === 'balance') {
            const numValue = typeof value === 'string' ? parseInt(value.replace(/[^-\d]/g, '')) : value;
            if (typeof numValue === 'number') {
                return { ...base, color: numValue >= 0 ? '#00b894' : '#d63031', fontWeight: 600 };
            }
        }
        if (category === 'event') {
            return { ...base, textAlign: 'left' as const, fontSize: '11px', color: '#666', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' };
        }
        if (category === 'age') {
            return { ...base, color: '#636e72', textAlign: 'center' as const };
        }
        return base;
    };

    const renderRow = (row: RowDef, idx: number, isSubRow = false) => {
        const hasSubRows = row.subRows && row.subRows.length > 0;
        const expandKey = row.category === 'income' ? 'income' : row.category === 'expense' ? 'expense' : '';
        const isExpanded = expandKey ? expanded[expandKey] : false;

        return (
            <React.Fragment key={idx}>
                <tr style={{
                    borderBottom: '1px solid #f0f0f0',
                    background: hasSubRows ? '#fafafa' : 'transparent'
                }}>
                    <td style={{
                        position: 'sticky',
                        left: 0,
                        background: hasSubRows ? '#f5f5f5' : isSubRow ? '#fff' : '#fafafa',
                        zIndex: 1,
                        padding: isSubRow ? '6px 12px 6px 28px' : '10px 12px',
                        fontWeight: hasSubRows ? 600 : isSubRow ? 400 : 500,
                        fontSize: isSubRow ? '11px' : '13px',
                        color: isSubRow ? '#888' : '#333',
                        cursor: hasSubRows ? 'pointer' : 'default',
                        minWidth: '140px',
                        borderRight: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                        onClick={() => hasSubRows && expandKey && toggleExpand(expandKey)}
                    >
                        {hasSubRows && (
                            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                        )}
                        {row.label}
                    </td>
                    {data.map((d, dIdx) => {
                        const rawValue = row.getValue(d);
                        return (
                            <td key={dIdx} style={getCellStyle(row.category, rawValue)}>
                                {rawValue}
                            </td>
                        );
                    })}
                </tr>
                {hasSubRows && isExpanded && row.subRows?.map((subRow, subIdx) =>
                    renderRow({ ...subRow, category: row.category }, `${idx}-${subIdx}` as unknown as number, true)
                )}
            </React.Fragment>
        );
    };

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '13px', minWidth: 'max-content', width: '100%' }}>
                <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <th style={{
                            position: 'sticky',
                            left: 0,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            zIndex: 2,
                            padding: '12px',
                            color: 'white',
                            fontWeight: 600,
                            minWidth: '140px',
                            borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            項目 / 年
                        </th>
                        {years.map(year => (
                            <th key={year} style={{
                                padding: '10px 12px',
                                textAlign: 'center',
                                minWidth: '90px',
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '12px'
                            }}>
                                {year}年
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {mainRows.map((row, idx) => renderRow(row, idx))}
                </tbody>
            </table>
        </div>
    );
};

function formatMoney(value: number): string {
    if (value === 0) return '-';
    if (Math.abs(value) >= 10000) {
        return `${(value / 10000).toFixed(0)}万`;
    }
    return value.toLocaleString();
}
