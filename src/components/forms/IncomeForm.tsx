import React from 'react';
import { useAppStore } from '../../lib/store';
import styles from './Forms.module.css';
import { Trash2, AlertCircle } from 'lucide-react';

interface IncomeFormProps {
    filterType?: string;
}

// 収入タイプの表示名
const TYPE_LABELS: Record<string, string> = {
    salary: '給与収入',
    pension: '年金',
    retirement: '退職金',
    business: '事業収入',
    investment: '投資収入',
    other: 'その他',
};

export const IncomeForm: React.FC<IncomeFormProps> = ({ filterType }) => {
    const { incomes, removeIncome } = useAppStore();

    const filteredIncomes = filterType
        ? incomes.filter(i => i.type === filterType || (filterType === 'business' && (i.type === 'business' || i.type === 'other')))
        : incomes;

    // 収入項目から表示用の概要を取得
    const getIncomeSummary = (income: typeof incomes[0]): string => {
        const incomeType = income.type;
        switch (incomeType) {
            case 'salary':
                return '給与設定済み';
            case 'pension':
                return '年金設定済み';
            case 'retirement':
                return '退職金設定済み';
            default:
                return '設定済み';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.infoBox}>
                <AlertCircle size={16} />
                <span>
                    収入の追加・編集は左のメニューから専用フォームをご利用ください。
                    （給与、年金・退職金など）
                </span>
            </div>
            <div className={styles.list}>
                {filteredIncomes.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemDetail}>
                                {TYPE_LABELS[item.type] || item.type} | {getIncomeSummary(item)}
                            </span>
                        </div>
                        <button className={styles.deleteBtn} onClick={() => removeIncome(item.id)}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {filteredIncomes.length === 0 && <div className={styles.emptyState}>収入源はまだ登録されていません。</div>}
            </div>
        </div>
    );
};
