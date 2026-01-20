import React, { useState } from 'react';
import { YearlyResult } from '../../lib/types';
import { useAppStore } from '../../lib/store';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';
import { generateDetailedCSV, downloadCSV } from '../../lib/csvExport';

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
    getEducationStage?: (d: YearlyResult) => string | undefined;
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const { family } = useAppStore();
    const years = data.map(d => d.year);

    // 展開状態の管理
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        income: false,
        expense: false,
        assetChange: false
    });

    const toggleExpand = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // CSVエクスポート
    const handleExportCSV = () => {
        const csv = generateDetailedCSV(data, family);
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        downloadCSV(csv, `lifeplan_detail_${dateStr}.csv`);
    };

    // 夫と妻の名前を取得
    const husband = family.find(m => m.role === 'husband');
    const wife = family.find(m => m.role === 'wife');
    const husbandName = husband?.name || '夫';
    const wifeName = wife?.name || '妻';

    // 子供のメンバーをフィルタリング
    const children = family.filter(m => m.role === 'child');

    // 子供の行を動的に生成
    const childrenRows: RowDef[] = children.map((child, idx) => ({
        label: `${child.name || `子${idx + 1}`}`,
        getValue: (d: YearlyResult) => {
            const age = d.year - child.birthYear;
            const stage = d.childrenEducationStages?.[child.id];
            // 卒業後・未就学は教育段階を表示しない
            const stageLabel = (stage && stage !== 'graduated' && stage !== 'preschool') ? EDUCATION_STAGE_LABELS[stage] || stage : '';
            if (age < 0) return '未誕生';
            return `${age}歳${stageLabel ? ` (${stageLabel})` : ''}`;
        },
        category: 'age' as const,
        getEducationStage: (d: YearlyResult) => d.childrenEducationStages?.[child.id]
    }));

    // メインのデータ行
    const mainRows: RowDef[] = [
        // 年齢セクション
        { label: `${husbandName}`, getValue: (d: YearlyResult) => d.ageHusband != null ? `${d.ageHusband}歳` : '-', category: 'age' },
        { label: `${wifeName}`, getValue: (d: YearlyResult) => d.ageWife != null ? `${d.ageWife}歳` : '-', category: 'age' },
        ...childrenRows,
        // イベント（家族行のすぐ下）
        { label: '📅 イベント', getValue: (d: YearlyResult) => d.events.join('\n') || '-', category: 'event' },
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
        { 
            label: '📊 資産増減',
            getValue: (d: YearlyResult) => formatMoney(d.assetChangeBreakdown?.totalChange || 0),
            category: 'balance',
            subRows: [
                { label: '収支影響', getValue: (d: YearlyResult) => formatMoney(d.assetChangeBreakdown?.cashFlowImpact || 0), indent: true },
                { label: '運用益', getValue: (d: YearlyResult) => formatMoney(d.assetChangeBreakdown?.interestGain || 0), indent: true },
                { label: '積立投資', getValue: (d: YearlyResult) => formatMoney(d.assetChangeBreakdown?.accumulationContribution || 0), indent: true },
            ]
        },
        { label: '🏦 資産残高', getValue: (d: YearlyResult) => formatMoney(d.totalAssets), category: 'balance' },
    ];

    // 教育段階に応じた背景色を返す
    const getEducationStageBackground = (stage?: string): string | undefined => {
        switch (stage) {
            case 'kindergarten': return 'rgba(255, 235, 205, 0.5)'; // 幼稚園 - オレンジ薄め
            case 'elementary': return 'rgba(255, 250, 205, 0.5)'; // 小学校 - 黄色薄め
            case 'middleSchool': return 'rgba(224, 255, 224, 0.5)'; // 中学校 - 緑薄め
            case 'highSchool': return 'rgba(224, 240, 255, 0.5)'; // 高校 - 青薄め
            case 'university': return 'rgba(240, 224, 255, 0.5)'; // 大学 - 紫薄め
            default: return undefined;
        }
    };

    const getCellStyle = (category?: string, value?: number | string, educationStage?: string) => {
        const base: React.CSSProperties = {
            padding: '4px 4px',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            fontSize: '10px',
            maxWidth: '68px'
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
            return { ...base, textAlign: 'left' as const, fontSize: '10px', color: '#666', whiteSpace: 'pre-line' as const, lineHeight: 1.3, maxWidth: 'none' };
        }
        if (category === 'age') {
            const bg = getEducationStageBackground(educationStage);
            return { ...base, color: '#636e72', textAlign: 'center' as const, background: bg };
        }
        return base;
    };

    const renderRow = (row: RowDef, idx: number, isSubRow = false) => {
        const hasSubRows = row.subRows && row.subRows.length > 0;
        // 展開キーを判定（資産増減行はラベルで判定）
        let expandKey = '';
        if (row.category === 'income') expandKey = 'income';
        else if (row.category === 'expense') expandKey = 'expense';
        else if (row.label === '📊 資産増減') expandKey = 'assetChange';
        const isExpanded = expandKey ? expanded[expandKey] : false;

        // 総収入行と資産増減行の上に太線を引く（薄いグレー）
        const needsTopBorder = row.label === '📈 総収入' || row.label === '📊 資産増減';

        return (
            <React.Fragment key={idx}>
                <tr style={{
                    borderBottom: '1px solid #f0f0f0',
                    borderTop: needsTopBorder ? '2px solid #ccc' : undefined,
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
                        width: '140px',
                        minWidth: '140px',
                        maxWidth: '140px',
                        borderRight: '1px solid #eee',
                        verticalAlign: 'middle'
                    }}
                        onClick={() => hasSubRows && expandKey && toggleExpand(expandKey)}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {hasSubRows && (
                                isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                            )}
                            {row.label}
                        </span>
                    </td>
                    {data.map((d, dIdx) => {
                        const rawValue = row.getValue(d);
                        const educationStage = row.getEducationStage?.(d);
                        return (
                            <td key={dIdx} style={getCellStyle(row.category, rawValue, educationStage)}>
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
            <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                marginBottom: '8px',
                paddingRight: '4px'
            }}>
                <button
                    onClick={handleExportCSV}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                    <Download size={16} />
                    CSVエクスポート
                </button>
            </div>
            <table style={{ borderCollapse: 'collapse', fontSize: '13px', minWidth: 'max-content', width: '100%', tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: '140px', minWidth: '140px' }} />
                    {years.map(year => (
                        <col key={year} style={{ width: '68px', minWidth: '38px' }} />
                    ))}
                </colgroup>
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
                            width: '140px',
                            minWidth: '140px',
                            maxWidth: '140px',
                            borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            項目 / 年
                        </th>
                        {years.map(year => (
                            <th key={year} style={{
                                padding: '6px 2px',
                                textAlign: 'center',
                                minWidth: '38px',
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '10px'
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
