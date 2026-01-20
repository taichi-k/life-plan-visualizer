import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { OtherIncome, Periodicity } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';

// 万円 <-> 円 変換ヘルパー
const toMan = (yen: number) => yen / 10000;
const toYen = (man: number) => man * 10000;

const PERIODICITY_OPTIONS: { value: Periodicity; label: string }[] = [
    { value: 'monthly', label: '月額' },
    { value: 'yearly', label: '年額' },
    { value: 'one-time', label: '一時金' },
];

const TYPE_OPTIONS: { value: 'business' | 'other'; label: string }[] = [
    { value: 'other', label: 'その他収入' },
    { value: 'business', label: '事業収入' },
];

export const OtherIncomeForm: React.FC = () => {
    const { family, incomes, addIncome, updateIncome, removeIncome } = useAppStore();
    const otherIncomes = incomes.filter(i => i.type === 'business' || i.type === 'other') as OtherIncome[];

    const currentYear = new Date().getFullYear();

    // 新規追加用
    const [name, setName] = useState('');
    const [type, setType] = useState<'business' | 'other'>('other');
    const [ownerId, setOwnerId] = useState(family[0]?.id || '');
    const [amountMan, setAmountMan] = useState(10);
    const [periodicity, setPeriodicity] = useState<Periodicity>('monthly');
    const [startYear, setStartYear] = useState(currentYear);
    const [endYear, setEndYear] = useState(currentYear + 30);

    // 編集用
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<'business' | 'other'>('other');
    const [editOwnerId, setEditOwnerId] = useState('');
    const [editAmountMan, setEditAmountMan] = useState(0);
    const [editPeriodicity, setEditPeriodicity] = useState<Periodicity>('monthly');
    const [editStartYear, setEditStartYear] = useState(currentYear);
    const [editEndYear, setEditEndYear] = useState(currentYear + 30);

    const handleAdd = () => {
        if (!name) return;
        const income: OtherIncome = {
            id: crypto.randomUUID(),
            type,
            name,
            ownerId: ownerId || undefined,
            amount: toYen(amountMan),
            periodicity,
            startYear,
            endYear,
        };
        addIncome(income);
        setName('');
        setAmountMan(10);
    };

    const handleStartEdit = (item: OtherIncome) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditType(item.type);
        setEditOwnerId(item.ownerId || '');
        setEditAmountMan(toMan(item.amount));
        setEditPeriodicity(item.periodicity);
        setEditStartYear(item.startYear || currentYear);
        setEditEndYear(item.endYear || currentYear + 30);
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const updated: OtherIncome = {
            id: editingId,
            type: editType,
            name: editName,
            ownerId: editOwnerId || undefined,
            amount: toYen(editAmountMan),
            periodicity: editPeriodicity,
            startYear: editStartYear,
            endYear: editEndYear,
        };
        updateIncome(editingId, updated);
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const getTypeLabel = (t: 'business' | 'other') => {
        return TYPE_OPTIONS.find(o => o.value === t)?.label || t;
    };

    const formatAmount = (item: OtherIncome) => {
        const amountManValue = toMan(item.amount);
        if (item.periodicity === 'monthly') {
            return `${amountManValue}万円/月 (年額約${amountManValue * 12}万円)`;
        } else if (item.periodicity === 'yearly') {
            return `${amountManValue}万円/年`;
        } else {
            return `${amountManValue}万円 (一時金)`;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {otherIncomes.map((item) => {
                    const owner = family.find(f => f.id === item.ownerId);
                    return (
                        <div key={item.id} className={`${styles.listItem} ${editingId === item.id ? styles.editing : ''}`}>
                            {editingId === item.id ? (
                                <div className={styles.editFormFull}>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>名称</label>
                                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>種類</label>
                                            <select value={editType} onChange={(e) => setEditType(e.target.value as 'business' | 'other')}>
                                                {TYPE_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>対象者</label>
                                            <select value={editOwnerId} onChange={(e) => setEditOwnerId(e.target.value)}>
                                                <option value="">指定なし</option>
                                                {family.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>金額単位</label>
                                            <select value={editPeriodicity} onChange={(e) => setEditPeriodicity(e.target.value as Periodicity)}>
                                                {PERIODICITY_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>金額 (万円)</label>
                                            <input type="number" step="0.1" value={editAmountMan} onChange={(e) => setEditAmountMan(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>開始年</label>
                                            <input type="number" value={editStartYear} onChange={(e) => setEditStartYear(Number(e.target.value))} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>終了年</label>
                                            <input type="number" value={editEndYear} onChange={(e) => setEditEndYear(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className={styles.editActions}>
                                        <button className={styles.saveBtn} onClick={handleSaveEdit}>
                                            <Check size={16} /> 確定
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
                                            {getTypeLabel(item.type)} | {formatAmount(item)} | {item.startYear}年〜{item.endYear}年
                                            {owner && ` | ${owner.name}`}
                                        </span>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <button className={styles.editBtn} onClick={() => handleStartEdit(item)}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button className={styles.deleteBtn} onClick={() => removeIncome(item.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
                {otherIncomes.length === 0 && <div className={styles.emptyState}>その他収入はまだ登録されていません</div>}
            </div>

            <div className={styles.addForm}>
                <div className={styles.formTitle}>新規追加</div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>名称</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 副業収入、配当金、不動産収入" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>種類</label>
                        <select value={type} onChange={(e) => setType(e.target.value as 'business' | 'other')}>
                            {TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>対象者</label>
                        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                            <option value="">指定なし</option>
                            {family.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>金額単位</label>
                        <select value={periodicity} onChange={(e) => setPeriodicity(e.target.value as Periodicity)}>
                            {PERIODICITY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>金額 (万円)</label>
                        <input type="number" step="0.1" value={amountMan} onChange={(e) => setAmountMan(Number(e.target.value))} />
                        <small>
                            {periodicity === 'monthly' && `年額換算: 約${(amountMan * 12).toFixed(0)}万円`}
                        </small>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>開始年</label>
                        <input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>終了年</label>
                        <input type="number" value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} />
                    </div>
                </div>
                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} /> 追加
                </button>
            </div>
        </div>
    );
};
