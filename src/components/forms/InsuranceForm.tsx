import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { InsuranceExpense } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';

const INSURANCE_TYPE_LABELS: Record<string, string> = {
    life: '生命保険',
    medical: '医療保険',
    cancer: 'がん保険',
    income: '収入保障保険',
    other: 'その他',
};

export const InsuranceForm: React.FC = () => {
    const { expenses, addExpense, updateExpense, removeExpense, settings } = useAppStore();
    const insuranceExpenses = expenses.filter(e => e.category === 'insurance') as InsuranceExpense[];

    // 新規追加用
    const [insuranceName, setInsuranceName] = useState('生命保険');
    const [insuranceType, setInsuranceType] = useState<'life' | 'medical' | 'cancer' | 'income' | 'other'>('life');
    const [insuranceMonthly, setInsuranceMonthly] = useState(15000);
    const [insuranceStartYear, setInsuranceStartYear] = useState(settings.calculationStartYear);
    const [insuranceEndYear, setInsuranceEndYear] = useState(settings.calculationEndYear);

    // 編集用
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<'life' | 'medical' | 'cancer' | 'income' | 'other'>('life');
    const [editMonthly, setEditMonthly] = useState(0);
    const [editStartYear, setEditStartYear] = useState(0);
    const [editEndYear, setEditEndYear] = useState(0);

    const handleAdd = () => {
        const insurance: InsuranceExpense = {
            id: crypto.randomUUID(),
            category: 'insurance',
            name: insuranceName,
            insuranceType,
            monthlyPremium: insuranceMonthly,
            startYear: insuranceStartYear,
            endYear: insuranceEndYear,
        };
        addExpense(insurance);
        setInsuranceName('生命保険');
        setInsuranceMonthly(15000);
    };

    const handleStartEdit = (item: InsuranceExpense) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditType(item.insuranceType);
        setEditMonthly(item.monthlyPremium);
        setEditStartYear(item.startYear || settings.calculationStartYear);
        setEditEndYear(item.endYear || settings.calculationEndYear);
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const updated: InsuranceExpense = {
            id: editingId,
            category: 'insurance',
            name: editName,
            insuranceType: editType,
            monthlyPremium: editMonthly,
            startYear: editStartYear,
            endYear: editEndYear,
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
                <span>生命保険、医療保険、がん保険などの保険料を設定します。</span>
            </div>

            <div className={styles.list}>
                {insuranceExpenses.map(item => (
                    <div key={item.id} className={styles.listItem}>
                        {editingId === item.id ? (
                            <div className={styles.editFormFull}>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>名称</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>種類</label>
                                        <select value={editType} onChange={(e) => setEditType(e.target.value as any)}>
                                            <option value="life">生命保険</option>
                                            <option value="medical">医療保険</option>
                                            <option value="cancer">がん保険</option>
                                            <option value="income">収入保障保険</option>
                                            <option value="other">その他</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>月額保険料</label>
                                        <input
                                            type="number"
                                            value={editMonthly}
                                            onChange={(e) => setEditMonthly(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>開始年</label>
                                        <input
                                            type="number"
                                            value={editStartYear}
                                            onChange={(e) => setEditStartYear(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>終了年</label>
                                        <input
                                            type="number"
                                            value={editEndYear}
                                            onChange={(e) => setEditEndYear(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
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
                                        {INSURANCE_TYPE_LABELS[item.insuranceType]} | {item.monthlyPremium.toLocaleString()}円/月 | {item.startYear}年〜{item.endYear}年
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
                {insuranceExpenses.length === 0 && (
                    <div className={styles.emptyState}>保険はまだ登録されていません。</div>
                )}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>保険を追加</h3>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>名称</label>
                        <input
                            type="text"
                            value={insuranceName}
                            onChange={(e) => setInsuranceName(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>種類</label>
                        <select value={insuranceType} onChange={(e) => setInsuranceType(e.target.value as any)}>
                            <option value="life">生命保険</option>
                            <option value="medical">医療保険</option>
                            <option value="cancer">がん保険</option>
                            <option value="income">収入保障保険</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>月額保険料</label>
                    <input
                        type="number"
                        value={insuranceMonthly}
                        onChange={(e) => setInsuranceMonthly(Number(e.target.value))}
                    />
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>開始年</label>
                        <input
                            type="number"
                            value={insuranceStartYear}
                            onChange={(e) => setInsuranceStartYear(Number(e.target.value))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>終了年</label>
                        <input
                            type="number"
                            value={insuranceEndYear}
                            onChange={(e) => setInsuranceEndYear(Number(e.target.value))}
                        />
                    </div>
                </div>
                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} /> 追加
                </button>
            </div>
        </div>
    );
};
