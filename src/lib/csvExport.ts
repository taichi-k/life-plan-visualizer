import { YearlyResult, FamilyMember } from './types';

/**
 * シミュレーション結果を詳細なCSVに変換する
 */
export function generateDetailedCSV(
    data: YearlyResult[],
    family: FamilyMember[]
): string {
    if (data.length === 0) return '';

    const rows: string[][] = [];

    // ================== ヘッダー行 ==================
    // 年の配列を作成
    const years = data.map(d => d.year);
    rows.push(['項目', '内訳', ...years.map(y => `${y}年`)]);

    // ================== 家族の年齢 ==================
    rows.push(['【家族の年齢】', '', ...Array(years.length).fill('')]);
    
    family.forEach(member => {
        const ages = data.map(d => {
            const info = d.familyAges[member.id];
            return info ? `${info.age}` : '-';
        });
        const roleLabel = getRoleLabel(member.role);
        rows.push([`${member.name} (${roleLabel})`, '年齢', ...ages]);
    });

    // 子供の教育段階
    const children = family.filter(m => m.role === 'child');
    children.forEach(child => {
        const stages = data.map(d => {
            const stage = d.childrenEducationStages[child.id];
            return getEducationStageLabel(stage) || '-';
        });
        rows.push([`${child.name}`, '教育段階', ...stages]);
    });

    // ================== ライフイベント ==================
    rows.push(['【ライフイベント】', '', ...Array(years.length).fill('')]);
    const eventRows = data.map(d => d.events.join(' / ') || '-');
    rows.push(['イベント', '', ...eventRows]);

    // ================== 収入詳細 ==================
    rows.push(['【収入】', '', ...Array(years.length).fill('')]);
    
    // 収入合計
    rows.push(['総収入', '合計', ...data.map(d => d.totalIncome.toString())]);
    
    // 収入カテゴリ別
    rows.push(['', '給与収入', ...data.map(d => (d.incomeBreakdown?.salary || 0).toString())]);
    rows.push(['', '年金収入', ...data.map(d => (d.incomeBreakdown?.pension || 0).toString())]);
    rows.push(['', '退職金', ...data.map(d => (d.incomes['retirement'] || 0).toString())]);
    rows.push(['', '投資収益', ...data.map(d => (d.incomes['investment'] || 0).toString())]);
    rows.push(['', '事業収入', ...data.map(d => (d.incomes['business'] || 0).toString())]);
    rows.push(['', 'その他収入', ...data.map(d => (d.incomes['other'] || 0).toString())]);

    // 収入詳細（各収入項目）
    rows.push(['（収入項目詳細）', '', ...Array(years.length).fill('')]);
    const incomeNames = getUniqueItemNames(data, 'income');
    incomeNames.forEach(name => {
        const values = data.map(d => {
            const detail = d.incomeDetails.find(item => item.name === name);
            return detail ? detail.amount.toString() : '0';
        });
        rows.push(['', name, ...values]);
    });

    // ================== 支出詳細 ==================
    rows.push(['【支出】', '', ...Array(years.length).fill('')]);
    
    // 支出合計
    rows.push(['総支出', '合計', ...data.map(d => d.totalExpense.toString())]);
    
    // 支出カテゴリ別
    rows.push(['', '住居費', ...data.map(d => (d.expenseBreakdown?.housing || 0).toString())]);
    rows.push(['', '税金・社会保険', ...data.map(d => (d.expenseBreakdown?.tax || 0).toString())]);
    rows.push(['', '教育費', ...data.map(d => (d.expenseBreakdown?.education || 0).toString())]);
    rows.push(['', '生活費', ...data.map(d => (d.expenseBreakdown?.living || 0).toString())]);
    rows.push(['', '光熱水費', ...data.map(d => (d.expenseBreakdown?.utility || 0).toString())]);
    rows.push(['', '通信費', ...data.map(d => (d.expenseBreakdown?.communication || 0).toString())]);
    rows.push(['', '医療費', ...data.map(d => (d.expenseBreakdown?.medical || 0).toString())]);
    rows.push(['', '保険料', ...data.map(d => (d.expenseBreakdown?.insurance || 0).toString())]);
    rows.push(['', '自動車関連', ...data.map(d => (d.expenseBreakdown?.car || 0).toString())]);
    rows.push(['', 'お小遣い', ...data.map(d => (d.expenseBreakdown?.allowance || 0).toString())]);
    rows.push(['', 'イベント支出', ...data.map(d => (d.expenseBreakdown?.event || 0).toString())]);
    rows.push(['', 'その他支出', ...data.map(d => (d.expenseBreakdown?.other || 0).toString())]);

    // 支出詳細（各支出項目）
    rows.push(['（支出項目詳細）', '', ...Array(years.length).fill('')]);
    const expenseNames = getUniqueItemNames(data, 'expense');
    expenseNames.forEach(name => {
        const values = data.map(d => {
            const detail = d.expenseDetails.find(item => item.name === name);
            return detail ? detail.amount.toString() : '0';
        });
        rows.push(['', name, ...values]);
    });

    // ================== 収支・資産 ==================
    rows.push(['【収支・資産】', '', ...Array(years.length).fill('')]);
    
    // 年間収支
    rows.push(['年間収支', '', ...data.map(d => d.cashFlow.toString())]);
    
    // 資産変動の内訳
    rows.push(['資産増減', '合計', ...data.map(d => (d.assetChangeBreakdown?.totalChange || 0).toString())]);
    rows.push(['', '収支影響', ...data.map(d => (d.assetChangeBreakdown?.cashFlowImpact || 0).toString())]);
    rows.push(['', '運用益', ...data.map(d => (d.assetChangeBreakdown?.interestGain || 0).toString())]);
    rows.push(['', '積立投資', ...data.map(d => (d.assetChangeBreakdown?.accumulationContribution || 0).toString())]);
    
    // 資産残高合計
    rows.push(['資産残高', '合計', ...data.map(d => d.totalAssets.toString())]);

    // 資産種類別（もし複数の資産がある場合）
    const assetIds = Object.keys(data[0]?.assets || {});
    if (assetIds.length > 1) {
        rows.push(['（資産別内訳）', '', ...Array(years.length).fill('')]);
        assetIds.forEach(assetId => {
            const values = data.map(d => (d.assets[assetId] || 0).toString());
            rows.push(['', assetId, ...values]);
        });
    }

    // ================== CSVに変換 ==================
    return rows.map(row => row.map(cell => escapeCSVCell(cell)).join(',')).join('\n');
}

/**
 * CSVセルをエスケープする
 */
function escapeCSVCell(cell: string): string {
    // カンマ、改行、ダブルクォートを含む場合はダブルクォートで囲む
    if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
        return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
}

/**
 * 役割のラベルを取得
 */
function getRoleLabel(role: string): string {
    switch (role) {
        case 'husband': return '夫';
        case 'wife': return '妻';
        case 'child': return '子';
        case 'other': return 'その他';
        default: return role;
    }
}

/**
 * 教育段階のラベルを取得
 */
function getEducationStageLabel(stage?: string): string | undefined {
    if (!stage) return undefined;
    const labels: Record<string, string> = {
        preschool: '未就学',
        kindergarten: '幼稚園',
        elementary: '小学校',
        middleSchool: '中学校',
        highSchool: '高校',
        university: '大学',
        graduated: '卒業'
    };
    return labels[stage];
}

/**
 * 収入または支出の項目名をユニークに取得
 */
function getUniqueItemNames(data: YearlyResult[], type: 'income' | 'expense'): string[] {
    const names = new Set<string>();
    data.forEach(d => {
        const details = type === 'income' ? d.incomeDetails : d.expenseDetails;
        details.forEach(item => names.add(item.name));
    });
    return Array.from(names).sort();
}

/**
 * CSVをダウンロードする
 */
export function downloadCSV(csvContent: string, filename: string): void {
    // BOMを追加してExcelで文字化けしないようにする
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
