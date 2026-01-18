import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { TaxExpense } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Edit2, Check, X, Receipt } from 'lucide-react';

export const TaxForm: React.FC = () => {
    const { expenses, addExpense, updateExpense, removeExpense, settings } = useAppStore();
    const taxExpenses = expenses.filter(e => e.category === 'tax') as TaxExpense[];

    // 新規追加用
    const [useAutoTax, setUseAutoTax] = useState(true);
    const [customTaxAmount, setCustomTaxAmount] = useState(1000000);

    // 編集用
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editUseAuto, setEditUseAuto] = useState(true);
    const [editCustomAmount, setEditCustomAmount] = useState(0);

    const handleAdd = () => {
        const tax: TaxExpense = {
            id: crypto.randomUUID(),
            category: 'tax',
            name: '税金・社会保険',
            useAutoCalculation: useAutoTax,
            customAmount: useAutoTax ? undefined : customTaxAmount,
            customPeriodicity: 'yearly',
            startYear: settings.calculationStartYear,
        };
        addExpense(tax);
    };

    const handleStartEdit = (item: TaxExpense) => {
        setEditingId(item.id);
        setEditUseAuto(item.useAutoCalculation);
        setEditCustomAmount(item.customAmount || 1000000);
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const updated: TaxExpense = {
            id: editingId,
            category: 'tax',
            name: '税金・社会保険',
            useAutoCalculation: editUseAuto,
            customAmount: editUseAuto ? undefined : editCustomAmount,
            customPeriodicity: 'yearly',
            startYear: settings.calculationStartYear,
        };
        updateExpense(editingId, updated);
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.helpText}>
                <Receipt size={16} />
                <span>所得税、住民税、社会保険料（健康保険、厚生年金、雇用保険）を設定します。自動計算は収入の約20%で概算します。</span>
            </div>

            <div className={styles.list}>
                {taxExpenses.map(item => (
                    <div key={item.id} className={styles.listItem}>
                        {editingId === item.id ? (
                            <div className={styles.editFormFull}>
                                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={editUseAuto}
                                        onChange={(e) => setEditUseAuto(e.target.checked)}
                                        style={{ width: 'auto', marginRight: '8px' }}
                                    />
                                    <label style={{ marginBottom: 0 }}>自動計算を使用（収入の約20%）</label>
                                </div>
                                {!editUseAuto && (
                                    <div className={styles.formGroup}>
                                        <label>年間税金・社会保険額</label>
                                        <input
                                            type="number"
                                            value={editCustomAmount}
                                            onChange={(e) => setEditCustomAmount(Number(e.target.value))}
                                        />
                                    </div>
                                )}
                                <div className={styles.itemActions}>
                                    <button className={styles.saveBtn} onClick={handleSaveEdit}>
                                        <Check size={16} /> 保存
                                    </button>
                                    <button className={styles.cancelBtn} onClick={handleCancelEdit}>
                                        <X size={16} /> キャンセル
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {item.useAutoCalculation ? '自動計算（収入の約20%）' : `${item.customAmount?.toLocaleString()}円/年`}
                                    </span>
                                </div>
                                <div className={styles.itemActions}>
                                    <button className={styles.editBtn} onClick={() => handleStartEdit(item)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {taxExpenses.length === 0 && (
                    <div className={styles.emptyState}>税金・社会保険はまだ登録されていません。</div>
                )}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>税金・社会保険を追加</h3>
                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <input
                        type="checkbox"
                        checked={useAutoTax}
                        onChange={(e) => setUseAutoTax(e.target.checked)}
                        style={{ width: 'auto', marginRight: '8px' }}
                    />
                    <label style={{ marginBottom: 0 }}>自動計算を使用（収入の約20%）</label>
                </div>
                {!useAutoTax && (
                    <div className={styles.formGroup}>
                        <label>年間税金・社会保険額</label>
                        <input
                            type="number"
                            value={customTaxAmount}
                            onChange={(e) => setCustomTaxAmount(Number(e.target.value))}
                        />
                    </div>
                )}
                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} /> 追加
                </button>
            </div>
        </div>
    );
};
