
import React from 'react';
import { useAppStore } from '../../lib/store';
import styles from './Forms.module.css';
import { Trash2, AlertCircle } from 'lucide-react';

interface ExpenseFormProps {
    filterCategory?: string;
}

// 支出カテゴリの表示名
const CATEGORY_LABELS: Record<string, string> = {
    housing: '住居費',
    tax: '税金・社保',
    education: '教育費',
    living: '生活費',
    utility: '光熱費',
    communication: '通信費',
    medical: '医療費',
    insurance: '保険',
    car: '自動車',
    allowance: 'お小遣い',
    other: 'その他',
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ filterCategory }) => {
    const { expenses, removeExpense } = useAppStore();

    const filteredExpenses = filterCategory
        ? expenses.filter(e => {
            if (filterCategory === 'living') return ['living', 'utility', 'communication', 'medical', 'allowance'].includes(e.category);
            if (filterCategory === 'housing') return ['housing'].includes(e.category);
            return e.category === filterCategory;
        })
        : expenses;

    // 支出項目から表示用の金額概要を取得
    const getExpenseSummary = (expense: typeof expenses[0]): string => {
        const category = expense.category;
        switch (category) {
            case 'housing':
                return '住居費設定済み';
            case 'education':
                return '教育費設定済み';
            case 'tax':
                return '税金・社保設定済み';
            case 'insurance':
                return '保険設定済み';
            case 'car':
                return '自動車関連設定済み';
            case 'living':
            case 'utility':
            case 'communication':
            case 'medical':
            case 'allowance':
                return '生活費設定済み';
            default:
                return '設定済み';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.infoBox}>
                <AlertCircle size={16} />
                <span>
                    支出の追加・編集は左のメニューから専用フォームをご利用ください。
                    （住宅費、教育費、生活費、保険・自動車など）
                </span>
            </div>
            <div className={styles.list}>
                {filteredExpenses.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemDetail}>
                                {CATEGORY_LABELS[item.category] || item.category} | {getExpenseSummary(item)}
                            </span>
                        </div>
                        <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {filteredExpenses.length === 0 && <div className={styles.emptyState}>支出はまだ登録されていません。</div>}
            </div>
        </div>
    );
};
