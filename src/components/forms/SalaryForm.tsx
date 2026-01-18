import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { SalaryIncome } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, TrendingUp, Edit2, Check, X } from 'lucide-react';

// 典型的な年齢別年収テンプレート
const SALARY_TEMPLATES = {
    standard: [
        { age: 22, annualAmount: 3000000 },
        { age: 30, annualAmount: 4500000 },
        { age: 40, annualAmount: 6000000 },
        { age: 50, annualAmount: 7000000 },
        { age: 60, annualAmount: 6500000 },
    ],
    highGrowth: [
        { age: 22, annualAmount: 4000000 },
        { age: 30, annualAmount: 7000000 },
        { age: 40, annualAmount: 10000000 },
        { age: 50, annualAmount: 12000000 },
        { age: 60, annualAmount: 10000000 },
    ],
    stable: [
        { age: 22, annualAmount: 3500000 },
        { age: 30, annualAmount: 4000000 },
        { age: 40, annualAmount: 4500000 },
        { age: 50, annualAmount: 5000000 },
        { age: 60, annualAmount: 5000000 },
    ],
};

// 線形補間関数
function interpolateSalary(ageCurve: { age: number; annualAmount: number }[], targetAge: number): number {
    if (ageCurve.length === 0) return 0;
    const sorted = [...ageCurve].sort((a, b) => a.age - b.age);

    if (targetAge <= sorted[0].age) return sorted[0].annualAmount;
    if (targetAge >= sorted[sorted.length - 1].age) return sorted[sorted.length - 1].annualAmount;

    for (let i = 0; i < sorted.length - 1; i++) {
        if (targetAge >= sorted[i].age && targetAge <= sorted[i + 1].age) {
            const ratio = (targetAge - sorted[i].age) / (sorted[i + 1].age - sorted[i].age);
            return Math.round(sorted[i].annualAmount + ratio * (sorted[i + 1].annualAmount - sorted[i].annualAmount));
        }
    }
    return 0;
}

export const SalaryForm: React.FC = () => {
    const { family, incomes, addIncome, removeIncome, updateIncome } = useAppStore();
    const salaryIncomes = incomes.filter(i => i.type === 'salary') as SalaryIncome[];

    const [name, setName] = useState('メイン給与');
    const [ownerId, setOwnerId] = useState(family.find(f => f.role === 'husband')?.id || family[0]?.id || '');
    const [ageCurve, setAgeCurve] = useState<{ age: number; annualAmount: number }[]>([
        { age: 25, annualAmount: 4000000 },
        { age: 35, annualAmount: 5500000 },
        { age: 45, annualAmount: 7000000 },
        { age: 55, annualAmount: 7500000 },
    ]);
    const [startAge, setStartAge] = useState(22);
    const [endAge, setEndAge] = useState(65);
    const [includesBonus, setIncludesBonus] = useState(true);
    const [bonusMonths, setBonusMonths] = useState(4);
    const [autoCalculateTax, setAutoCalculateTax] = useState(true);

    // 編集モード
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAgeCurve, setEditAgeCurve] = useState<{ age: number; annualAmount: number }[]>([]);
    const [editStartAge, setEditStartAge] = useState(22);
    const [editEndAge, setEditEndAge] = useState(65);

    // 入力済み年齢のセット
    const inputAges = useMemo(() => new Set(ageCurve.map(c => c.age)), [ageCurve]);
    const editInputAges = useMemo(() => new Set(editAgeCurve.map(c => c.age)), [editAgeCurve]);

    // 全年齢(0-100)のデータを生成
    const generateAllAges = (curve: { age: number; annualAmount: number }[], start: number, end: number, inputSet: Set<number>) => {
        const allAges: { age: number; amount: number; isInput: boolean }[] = [];
        for (let age = 0; age <= 100; age++) {
            let amount = 0;
            if (age >= start && age <= end) {
                amount = interpolateSalary(curve, age);
            }
            allAges.push({ age, amount, isInput: inputSet.has(age) });
        }
        return allAges;
    };

    const allAgesData = useMemo(() => generateAllAges(ageCurve, startAge, endAge, inputAges), [ageCurve, startAge, endAge, inputAges]);
    const editAllAgesData = useMemo(() => generateAllAges(editAgeCurve, editStartAge, editEndAge, editInputAges), [editAgeCurve, editStartAge, editEndAge, editInputAges]);

    const applyTemplate = (template: keyof typeof SALARY_TEMPLATES) => {
        setAgeCurve([...SALARY_TEMPLATES[template]]);
    };

    const handleAgeClick = (age: number, isEditing: boolean = false) => {
        const curve = isEditing ? editAgeCurve : ageCurve;
        const setCurve = isEditing ? setEditAgeCurve : setAgeCurve;
        const existing = curve.find(c => c.age === age);

        if (existing) {
            // 編集ダイアログを表示（簡易的にprompt使用）
            const newAmount = prompt(`${age}歳の年収を入力 (現在: ${existing.annualAmount.toLocaleString()}円)`, String(existing.annualAmount));
            if (newAmount === null) return;
            if (newAmount === '') {
                // 削除
                setCurve(curve.filter(c => c.age !== age));
            } else {
                setCurve(curve.map(c => c.age === age ? { ...c, annualAmount: Number(newAmount) } : c));
            }
        } else {
            // 新規追加
            const interpolated = interpolateSalary(curve, age);
            const newAmount = prompt(`${age}歳の年収を入力`, String(interpolated));
            if (newAmount === null || newAmount === '') return;
            setCurve([...curve, { age, annualAmount: Number(newAmount) }].sort((a, b) => a.age - b.age));
        }
    };

    const handleAdd = () => {
        if (!name || !ownerId) return;
        const salary: SalaryIncome = {
            id: crypto.randomUUID(),
            type: 'salary',
            name,
            ownerId,
            useAutoComplete: true,
            ageCurve: [...ageCurve],
            startAge,
            endAge,
            includesBonus,
            bonusMonths: includesBonus ? bonusMonths : undefined,
            autoCalculateTax,
        };
        addIncome(salary);
        setName('副業給与');
    };

    const startEdit = (income: SalaryIncome) => {
        setEditingId(income.id);
        setEditAgeCurve([...income.ageCurve]);
        setEditStartAge(income.startAge || 22);
        setEditEndAge(income.endAge || 65);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = () => {
        if (!editingId) return;
        updateIncome(editingId, {
            ageCurve: [...editAgeCurve],
            startAge: editStartAge,
            endAge: editEndAge,
        });
        setEditingId(null);
    };

    const renderAgeGrid = (ages: { age: number; amount: number; isInput: boolean }[], isEditing: boolean) => (
        <div className={styles.ageGrid}>
            {ages.map(({ age, amount, isInput }) => (
                <div
                    key={age}
                    className={`${styles.ageCell} ${amount > 0 ? styles.active : ''}`}
                    onClick={() => handleAgeClick(age, isEditing)}
                    title={`${age}歳: ${amount.toLocaleString()}円/年 ${isInput ? '(入力値)' : '(自動補間)'}`}
                >
                    <span className={styles.ageCellAge}>{age}</span>
                    <span className={`${styles.ageCellAmount} ${isInput ? styles.inputValue : styles.interpolatedValue}`}>
                        {amount > 0 ? `${(amount / 10000).toFixed(0)}万` : '-'}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.helpText}>
                <TrendingUp size={16} />
                <span>年齢をクリックして年収を入力。<span style={{ color: '#d63031' }}>赤字</span>=入力値、<span style={{ color: '#0984e3' }}>青字</span>=自動補間値</span>
            </div>

            <div className={styles.list}>
                {salaryIncomes.map((item) => {
                    const itemOwner = family.find(f => f.id === item.ownerId);
                    return (
                        <div key={item.id} className={styles.listItem}>
                            {editingId === item.id ? (
                                <div className={styles.editFormFull}>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>就業開始年齢</label>
                                            <input type="number" value={editStartAge} onChange={(e) => setEditStartAge(Number(e.target.value))} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>退職年齢</label>
                                            <input type="number" value={editEndAge} onChange={(e) => setEditEndAge(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>年齢別年収（クリックで編集）</label>
                                        {renderAgeGrid(editAllAgesData, true)}
                                    </div>
                                    <div className={styles.editActions}>
                                        <button className={styles.saveBtn} onClick={saveEdit}>
                                            <Check size={16} /> 保存
                                        </button>
                                        <button className={styles.cancelBtn} onClick={cancelEdit}>
                                            <X size={16} /> キャンセル
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemDetail}>
                                            {itemOwner?.name || '不明'} | {item.startAge}歳〜{item.endAge}歳
                                        </span>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <button className={styles.editBtn} onClick={() => startEdit(item)} title="編集">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className={styles.deleteBtn} onClick={() => removeIncome(item.id)} title="削除">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
                {salaryIncomes.length === 0 && <div className={styles.emptyState}>給与はまだ登録されていません。</div>}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>給与収入を追加</h3>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>名称</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: メイン給与" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>対象者</label>
                        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                            {family.length === 0 && <option value="">先に家族を登録してください</option>}
                            {family.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>就業開始年齢</label>
                        <input type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>退職年齢</label>
                        <input type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <input type="checkbox" checked={includesBonus} onChange={(e) => setIncludesBonus(e.target.checked)} style={{ width: 'auto', marginRight: '8px' }} />
                        <label style={{ marginBottom: 0 }}>ボーナス込み</label>
                    </div>
                    {includesBonus && (
                        <div className={styles.formGroup}>
                            <label>ボーナス (月数分)</label>
                            <input type="number" value={bonusMonths} onChange={(e) => setBonusMonths(Number(e.target.value))} step="0.5" />
                        </div>
                    )}
                </div>

                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <input type="checkbox" checked={autoCalculateTax} onChange={(e) => setAutoCalculateTax(e.target.checked)} style={{ width: 'auto', marginRight: '8px' }} />
                    <label style={{ marginBottom: 0 }}>所得税・社会保険料を自動計算して費用計上</label>
                </div>

                <div className={styles.formGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>テンプレート適用</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button type="button" className={styles.templateBtn} onClick={() => applyTemplate('standard')}>標準</button>
                            <button type="button" className={styles.templateBtn} onClick={() => applyTemplate('highGrowth')}>高成長</button>
                            <button type="button" className={styles.templateBtn} onClick={() => applyTemplate('stable')}>安定</button>
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>年齢別年収設定（クリックで入力/編集）</label>
                    {renderAgeGrid(allAgesData, false)}
                </div>

                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} />
                    給与を追加
                </button>
            </div>
        </div>
    );
};
