import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { PensionIncome, RetirementIncome, PENSION_CONSTANTS } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Calculator, Info, Edit2, Check, X } from 'lucide-react';

// 万円 <-> 円 変換ヘルパー
const toMan = (yen: number) => Math.round(yen / 10000);
const toYen = (man: number) => man * 10000;

export const PensionForm: React.FC = () => {
    const { family, incomes, addIncome, updateIncome, removeIncome, settings } = useAppStore();
    const pensionIncomes = incomes.filter(i => i.type === 'pension' || i.type === 'retirement');

    // 年金設定
    const [ownerId, setOwnerId] = useState(family.find(f => f.role === 'husband')?.id || family[0]?.id || '');
    const [pensionType, setPensionType] = useState<'national' | 'employee' | 'corporate' | 'custom'>('employee');
    const [nationalPensionYears, setNationalPensionYears] = useState(40);
    const [employeePensionYears, setEmployeePensionYears] = useState(38);
    const [averageMonthlyIncomeMan, setAverageMonthlyIncomeMan] = useState(35);
    const [hasCorporatePension, setHasCorporatePension] = useState(false);
    const [corporatePensionAmountMan, setCorporatePensionAmountMan] = useState(50);
    const [startAge, setStartAge] = useState(65);
    const [customAmountMan, setCustomAmountMan] = useState(0);

    // 退職金設定
    const [retirementName, setRetirementName] = useState('退職金');
    const [retirementOwnerId, setRetirementOwnerId] = useState(family.find(f => f.role === 'husband')?.id || family[0]?.id || '');
    const [retirementAmountMan, setRetirementAmountMan] = useState(2000);
    const [retirementYear, setRetirementYear] = useState(settings.calculationStartYear + 25);

    // 編集用ステート（年金）
    const [editingPensionId, setEditingPensionId] = useState<string | null>(null);
    const [editPensionOwnerId, setEditPensionOwnerId] = useState('');
    const [editPensionType, setEditPensionType] = useState<'national' | 'employee' | 'corporate' | 'custom'>('employee');
    const [editNationalPensionYears, setEditNationalPensionYears] = useState(40);
    const [editEmployeePensionYears, setEditEmployeePensionYears] = useState(38);
    const [editAverageMonthlyIncomeMan, setEditAverageMonthlyIncomeMan] = useState(35);
    const [editHasCorporatePension, setEditHasCorporatePension] = useState(false);
    const [editCorporatePensionAmountMan, setEditCorporatePensionAmountMan] = useState(50);
    const [editStartAge, setEditStartAge] = useState(65);
    const [editCustomAmountMan, setEditCustomAmountMan] = useState(0);

    // 編集用ステート（退職金）
    const [editingRetirementId, setEditingRetirementId] = useState<string | null>(null);
    const [editRetirementName, setEditRetirementName] = useState('');
    const [editRetirementOwnerId, setEditRetirementOwnerId] = useState('');
    const [editRetirementAmountMan, setEditRetirementAmountMan] = useState(0);
    const [editRetirementYear, setEditRetirementYear] = useState(0);

    // 年金額のプレビュー計算
    const calculatePensionPreview = (): number => {
        let total = 0;
        if (pensionType === 'custom') {
            return toYen(customAmountMan);
        }
        // 国民年金
        const nationalRatio = Math.min(nationalPensionYears, PENSION_CONSTANTS.nationalPensionMaxYears) / PENSION_CONSTANTS.nationalPensionMaxYears;
        total += PENSION_CONSTANTS.nationalPensionFullAmount * nationalRatio;
        // 厚生年金
        if (pensionType === 'employee' || pensionType === 'corporate') {
            total += toYen(averageMonthlyIncomeMan) * PENSION_CONSTANTS.employeePensionMultiplier * employeePensionYears * 12;
        }
        // 企業年金
        if (hasCorporatePension) {
            total += toYen(corporatePensionAmountMan);
        }
        return total;
    };

    // 編集用年金額のプレビュー計算
    const calculateEditPensionPreview = (): number => {
        let total = 0;
        if (editPensionType === 'custom') {
            return toYen(editCustomAmountMan);
        }
        // 国民年金
        const nationalRatio = Math.min(editNationalPensionYears, PENSION_CONSTANTS.nationalPensionMaxYears) / PENSION_CONSTANTS.nationalPensionMaxYears;
        total += PENSION_CONSTANTS.nationalPensionFullAmount * nationalRatio;
        // 厚生年金
        if (editPensionType === 'employee' || editPensionType === 'corporate') {
            total += toYen(editAverageMonthlyIncomeMan) * PENSION_CONSTANTS.employeePensionMultiplier * editEmployeePensionYears * 12;
        }
        // 企業年金
        if (editHasCorporatePension) {
            total += toYen(editCorporatePensionAmountMan);
        }
        return total;
    };

    // 年金編集開始
    const handleStartEditPension = (item: PensionIncome) => {
        setEditingPensionId(item.id);
        setEditPensionOwnerId(item.ownerId);
        setEditPensionType(item.pensionType);
        setEditNationalPensionYears(item.nationalPensionYears || 40);
        setEditEmployeePensionYears(item.employeePensionYears || 38);
        setEditAverageMonthlyIncomeMan(item.averageMonthlyIncome ? toMan(item.averageMonthlyIncome) : 35);
        setEditHasCorporatePension(item.hasCorporatePension || false);
        setEditCorporatePensionAmountMan(item.corporatePensionAmount ? toMan(item.corporatePensionAmount) : 50);
        setEditStartAge(item.startAge);
        setEditCustomAmountMan(item.customAmount ? toMan(item.customAmount) : 0);
    };

    // 年金編集保存
    const handleSavePension = () => {
        if (!editingPensionId) return;
        const owner = family.find(f => f.id === editPensionOwnerId);
        const updated: PensionIncome = {
            id: editingPensionId,
            type: 'pension',
            name: `${owner?.name || ''}の年金`,
            ownerId: editPensionOwnerId,
            pensionType: editPensionType,
            nationalPensionYears: editNationalPensionYears,
            employeePensionYears: editPensionType !== 'national' ? editEmployeePensionYears : undefined,
            averageMonthlyIncome: editPensionType !== 'national' ? toYen(editAverageMonthlyIncomeMan) : undefined,
            hasCorporatePension: editHasCorporatePension,
            corporatePensionAmount: editHasCorporatePension ? toYen(editCorporatePensionAmountMan) : undefined,
            startAge: editStartAge,
            customAmount: editPensionType === 'custom' ? toYen(editCustomAmountMan) : undefined,
        };
        updateIncome(editingPensionId, updated);
        setEditingPensionId(null);
    };

    // 退職金編集開始
    const handleStartEditRetirement = (item: RetirementIncome) => {
        setEditingRetirementId(item.id);
        setEditRetirementName(item.name);
        setEditRetirementOwnerId(item.ownerId);
        setEditRetirementAmountMan(toMan(item.amount));
        setEditRetirementYear(item.receiveYear);
    };

    // 退職金編集保存
    const handleSaveRetirement = () => {
        if (!editingRetirementId) return;
        const updated: RetirementIncome = {
            id: editingRetirementId,
            type: 'retirement',
            name: editRetirementName,
            ownerId: editRetirementOwnerId,
            amount: toYen(editRetirementAmountMan),
            receiveYear: editRetirementYear,
        };
        updateIncome(editingRetirementId, updated);
        setEditingRetirementId(null);
    };

    const handleCancelEdit = () => {
        setEditingPensionId(null);
        setEditingRetirementId(null);
    };

    const handleAddPension = () => {
        if (!ownerId) return;
        const owner = family.find(f => f.id === ownerId);
        const pension: PensionIncome = {
            id: crypto.randomUUID(),
            type: 'pension',
            name: `${owner?.name || ''}の年金`,
            ownerId,
            pensionType,
            nationalPensionYears,
            employeePensionYears: pensionType !== 'national' ? employeePensionYears : undefined,
            averageMonthlyIncome: pensionType !== 'national' ? toYen(averageMonthlyIncomeMan) : undefined,
            hasCorporatePension,
            corporatePensionAmount: hasCorporatePension ? toYen(corporatePensionAmountMan) : undefined,
            startAge,
            customAmount: pensionType === 'custom' ? toYen(customAmountMan) : undefined,
        };
        addIncome(pension);
    };

    const handleAddRetirement = () => {
        if (!retirementOwnerId) return;
        const retirement: RetirementIncome = {
            id: crypto.randomUUID(),
            type: 'retirement',
            name: retirementName,
            ownerId: retirementOwnerId,
            amount: toYen(retirementAmountMan),
            receiveYear: retirementYear,
        };
        addIncome(retirement);
    };

    return (
        <div className={styles.container}>
            <div className={styles.helpText}>
                <Calculator size={16} />
                <span>年金は就業状況に応じて自動計算されます。カスタム入力も可能です。</span>
            </div>

            <div className={styles.list}>
                {pensionIncomes.map((item) => {
                    const itemOwner = family.find(f => f.id === (item as PensionIncome | RetirementIncome).ownerId);
                    const isPension = item.type === 'pension';
                    const isRetirement = item.type === 'retirement';
                    
                    // 年金の編集中
                    if (isPension && editingPensionId === item.id) {
                        return (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.editFormFull}>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>対象者</label>
                                            <select value={editPensionOwnerId} onChange={(e) => setEditPensionOwnerId(e.target.value)}>
                                                {family.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>受給開始年齢</label>
                                            <select value={editStartAge} onChange={(e) => setEditStartAge(Number(e.target.value))}>
                                                <option value={60}>60歳（繰上げ）</option>
                                                <option value={65}>65歳（標準）</option>
                                                <option value={70}>70歳（繰下げ）</option>
                                                <option value={75}>75歳（繰下げ最大）</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>年金タイプ</label>
                                        <select value={editPensionType} onChange={(e) => setEditPensionType(e.target.value as 'national' | 'employee' | 'corporate' | 'custom')}>
                                            <option value="employee">会社員（厚生年金あり）</option>
                                            <option value="national">自営業（国民年金のみ）</option>
                                            <option value="corporate">会社員＋企業年金あり</option>
                                            <option value="custom">カスタム入力</option>
                                        </select>
                                    </div>

                                    {editPensionType !== 'custom' && (
                                        <>
                                            <div className={styles.row}>
                                                <div className={styles.formGroup}>
                                                    <label>国民年金加入年数</label>
                                                    <input
                                                        type="number"
                                                        value={editNationalPensionYears}
                                                        onChange={(e) => setEditNationalPensionYears(Number(e.target.value))}
                                                        max={40}
                                                    />
                                                </div>
                                                {editPensionType !== 'national' && (
                                                    <div className={styles.formGroup}>
                                                        <label>厚生年金加入年数</label>
                                                        <input
                                                            type="number"
                                                            value={editEmployeePensionYears}
                                                            onChange={(e) => setEditEmployeePensionYears(Number(e.target.value))}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {editPensionType !== 'national' && (
                                                <div className={styles.formGroup}>
                                                    <label>平均標準報酬月額（万円）</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={editAverageMonthlyIncomeMan}
                                                        onChange={(e) => setEditAverageMonthlyIncomeMan(Number(e.target.value))}
                                                    />
                                                </div>
                                            )}

                                            {editPensionType === 'corporate' && (
                                                <div className={styles.row}>
                                                    <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={editHasCorporatePension}
                                                            onChange={(e) => setEditHasCorporatePension(e.target.checked)}
                                                            style={{ width: 'auto', marginRight: '8px' }}
                                                        />
                                                        <label style={{ marginBottom: 0 }}>企業年金あり</label>
                                                    </div>
                                                    {editHasCorporatePension && (
                                                        <div className={styles.formGroup}>
                                                            <label>企業年金（年額・万円）</label>
                                                            <input
                                                                type="number"
                                                                value={editCorporatePensionAmountMan}
                                                                onChange={(e) => setEditCorporatePensionAmountMan(Number(e.target.value))}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {editPensionType === 'custom' && (
                                        <div className={styles.formGroup}>
                                            <label>年金額（年額・万円）</label>
                                            <input
                                                type="number"
                                                value={editCustomAmountMan}
                                                onChange={(e) => setEditCustomAmountMan(Number(e.target.value))}
                                            />
                                        </div>
                                    )}

                                    <div className={styles.previewBox}>
                                        <Info size={16} />
                                        <span>推定年金額: <strong>{toMan(calculateEditPensionPreview()).toLocaleString()}万円/年</strong></span>
                                    </div>

                                    <div className={styles.itemActions}>
                                        <button className={styles.saveBtn} onClick={handleSavePension}>
                                            <Check size={16} /> 保存
                                        </button>
                                        <button className={styles.cancelBtn} onClick={handleCancelEdit}>
                                            <X size={16} /> キャンセル
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    
                    // 退職金の編集中
                    if (isRetirement && editingRetirementId === item.id) {
                        return (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.editFormFull}>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>名称</label>
                                            <input
                                                type="text"
                                                value={editRetirementName}
                                                onChange={(e) => setEditRetirementName(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>対象者</label>
                                            <select value={editRetirementOwnerId} onChange={(e) => setEditRetirementOwnerId(e.target.value)}>
                                                {family.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>退職金額 (万円)</label>
                                            <input
                                                type="number"
                                                value={editRetirementAmountMan}
                                                onChange={(e) => setEditRetirementAmountMan(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>受給年</label>
                                            <input
                                                type="number"
                                                value={editRetirementYear}
                                                onChange={(e) => setEditRetirementYear(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <button className={styles.saveBtn} onClick={handleSaveRetirement}>
                                            <Check size={16} /> 保存
                                        </button>
                                        <button className={styles.cancelBtn} onClick={handleCancelEdit}>
                                            <X size={16} /> キャンセル
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    
                    // 通常表示
                    return (
                        <div key={item.id} className={styles.listItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemDetail}>
                                    {item.type === 'pension' ? '年金' : '退職金'} | {itemOwner?.name || '不明'}
                                    {isRetirement && ` | ${toMan((item as RetirementIncome).amount).toLocaleString()}万円 | ${(item as RetirementIncome).receiveYear}年`}
                                </span>
                            </div>
                            <div className={styles.itemActions}>
                                <button 
                                    className={styles.editBtn} 
                                    onClick={() => isPension 
                                        ? handleStartEditPension(item as PensionIncome) 
                                        : handleStartEditRetirement(item as RetirementIncome)
                                    }
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button className={styles.deleteBtn} onClick={() => removeIncome(item.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {pensionIncomes.length === 0 && <div className={styles.emptyState}>年金・退職金はまだ登録されていません。</div>}
            </div>

            {/* 年金登録フォーム */}
            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>年金を追加</h3>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>対象者</label>
                        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                            {family.length === 0 && <option value="">先に家族を登録</option>}
                            {family.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>受給開始年齢</label>
                        <select value={startAge} onChange={(e) => setStartAge(Number(e.target.value))}>
                            <option value={60}>60歳（繰上げ）</option>
                            <option value={65}>65歳（標準）</option>
                            <option value={70}>70歳（繰下げ）</option>
                            <option value={75}>75歳（繰下げ最大）</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>年金タイプ</label>
                    <select value={pensionType} onChange={(e) => setPensionType(e.target.value as 'national' | 'employee' | 'corporate' | 'custom')}>
                        <option value="employee">会社員（厚生年金あり）</option>
                        <option value="national">自営業（国民年金のみ）</option>
                        <option value="corporate">会社員＋企業年金あり</option>
                        <option value="custom">カスタム入力</option>
                    </select>
                </div>

                {pensionType !== 'custom' && (
                    <>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>国民年金加入年数</label>
                                <input
                                    type="number"
                                    value={nationalPensionYears}
                                    onChange={(e) => setNationalPensionYears(Number(e.target.value))}
                                    max={40}
                                />
                                <small>（最大40年）</small>
                            </div>
                            {pensionType !== 'national' && (
                                <div className={styles.formGroup}>
                                    <label>厚生年金加入年数</label>
                                    <input
                                        type="number"
                                        value={employeePensionYears}
                                        onChange={(e) => setEmployeePensionYears(Number(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>

                        {pensionType !== 'national' && (
                            <div className={styles.formGroup}>
                                <label>平均標準報酬月額（万円）</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={averageMonthlyIncomeMan}
                                    onChange={(e) => setAverageMonthlyIncomeMan(Number(e.target.value))}
                                />
                                <small>在職中の平均月収（賞与込みの場合は賞与/12も加算）</small>
                            </div>
                        )}

                        {pensionType === 'corporate' && (
                            <div className={styles.row}>
                                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={hasCorporatePension}
                                        onChange={(e) => setHasCorporatePension(e.target.checked)}
                                        style={{ width: 'auto', marginRight: '8px' }}
                                    />
                                    <label style={{ marginBottom: 0 }}>企業年金あり</label>
                                </div>
                                {hasCorporatePension && (
                                    <div className={styles.formGroup}>
                                        <label>企業年金（年額・万円）</label>
                                        <input
                                            type="number"
                                            value={corporatePensionAmountMan}
                                            onChange={(e) => setCorporatePensionAmountMan(Number(e.target.value))}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {pensionType === 'custom' && (
                    <div className={styles.formGroup}>
                        <label>年金額（年額・万円）</label>
                        <input
                            type="number"
                            value={customAmountMan}
                            onChange={(e) => setCustomAmountMan(Number(e.target.value))}
                        />
                    </div>
                )}

                <div className={styles.previewBox}>
                    <Info size={16} />
                    <span>推定年金額: <strong>{toMan(calculatePensionPreview()).toLocaleString()}万円/年</strong></span>
                    <span>（月額約{toMan(Math.round(calculatePensionPreview() / 12)).toLocaleString()}万円）</span>
                </div>

                <button className={styles.addBtn} onClick={handleAddPension}>
                    <Plus size={18} />
                    年金を追加
                </button>
            </div>

            {/* 退職金登録フォーム */}
            <div className={styles.addForm} style={{ marginTop: '16px' }}>
                <h3 className={styles.formTitle}>退職金を追加</h3>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>名称</label>
                        <input
                            type="text"
                            value={retirementName}
                            onChange={(e) => setRetirementName(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>対象者</label>
                        <select value={retirementOwnerId} onChange={(e) => setRetirementOwnerId(e.target.value)}>
                            {family.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>退職金額 (万円)</label>
                        <input
                            type="number"
                            value={retirementAmountMan}
                            onChange={(e) => setRetirementAmountMan(Number(e.target.value))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>受給年</label>
                        <input
                            type="number"
                            value={retirementYear}
                            onChange={(e) => setRetirementYear(Number(e.target.value))}
                        />
                    </div>
                </div>

                <button className={styles.addBtn} onClick={handleAddRetirement}>
                    <Plus size={18} />
                    退職金を追加
                </button>
            </div>
        </div>
    );
};
