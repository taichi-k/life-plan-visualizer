import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { PensionIncome, RetirementIncome, PENSION_CONSTANTS } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Calculator, Info } from 'lucide-react';

export const PensionForm: React.FC = () => {
    const { family, incomes, addIncome, removeIncome, settings } = useAppStore();
    const pensionIncomes = incomes.filter(i => i.type === 'pension' || i.type === 'retirement');

    // 年金設定
    const [ownerId, setOwnerId] = useState(family.find(f => f.role === 'husband')?.id || family[0]?.id || '');
    const [pensionType, setPensionType] = useState<'national' | 'employee' | 'corporate' | 'custom'>('employee');
    const [nationalPensionYears, setNationalPensionYears] = useState(40);
    const [employeePensionYears, setEmployeePensionYears] = useState(38);
    const [averageMonthlyIncome, setAverageMonthlyIncome] = useState(350000);
    const [hasCorporatePension, setHasCorporatePension] = useState(false);
    const [corporatePensionAmount, setCorporatePensionAmount] = useState(500000);
    const [startAge, setStartAge] = useState(65);
    const [customAmount, setCustomAmount] = useState(0);

    // 退職金設定
    const [retirementName, setRetirementName] = useState('退職金');
    const [retirementOwnerId, setRetirementOwnerId] = useState(family.find(f => f.role === 'husband')?.id || family[0]?.id || '');
    const [retirementAmount, setRetirementAmount] = useState(20000000);
    const [retirementYear, setRetirementYear] = useState(settings.calculationStartYear + 25);

    // 年金額のプレビュー計算
    const calculatePensionPreview = (): number => {
        let total = 0;
        if (pensionType === 'custom') {
            return customAmount;
        }
        // 国民年金
        const nationalRatio = Math.min(nationalPensionYears, PENSION_CONSTANTS.nationalPensionMaxYears) / PENSION_CONSTANTS.nationalPensionMaxYears;
        total += PENSION_CONSTANTS.nationalPensionFullAmount * nationalRatio;
        // 厚生年金
        if (pensionType === 'employee' || pensionType === 'corporate') {
            total += averageMonthlyIncome * PENSION_CONSTANTS.employeePensionMultiplier * employeePensionYears * 12;
        }
        // 企業年金
        if (hasCorporatePension) {
            total += corporatePensionAmount;
        }
        return total;
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
            averageMonthlyIncome: pensionType !== 'national' ? averageMonthlyIncome : undefined,
            hasCorporatePension,
            corporatePensionAmount: hasCorporatePension ? corporatePensionAmount : undefined,
            startAge,
            customAmount: pensionType === 'custom' ? customAmount : undefined,
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
            amount: retirementAmount,
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
                    const itemOwner = family.find(f => f.id === (item as any).ownerId);
                    return (
                        <div key={item.id} className={styles.listItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemDetail}>
                                    {item.type === 'pension' ? '年金' : '退職金'} | {itemOwner?.name || '不明'}
                                </span>
                            </div>
                            <button className={styles.deleteBtn} onClick={() => removeIncome(item.id)}>
                                <Trash2 size={18} />
                            </button>
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
                    <select value={pensionType} onChange={(e) => setPensionType(e.target.value as any)}>
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
                                <label>平均標準報酬月額（円）</label>
                                <input
                                    type="number"
                                    value={averageMonthlyIncome}
                                    onChange={(e) => setAverageMonthlyIncome(Number(e.target.value))}
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
                                        <label>企業年金（年額）</label>
                                        <input
                                            type="number"
                                            value={corporatePensionAmount}
                                            onChange={(e) => setCorporatePensionAmount(Number(e.target.value))}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {pensionType === 'custom' && (
                    <div className={styles.formGroup}>
                        <label>年金額（年額）</label>
                        <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(Number(e.target.value))}
                        />
                    </div>
                )}

                <div className={styles.previewBox}>
                    <Info size={16} />
                    <span>推定年金額: <strong>{calculatePensionPreview().toLocaleString()}円/年</strong></span>
                    <span>（月額約{Math.round(calculatePensionPreview() / 12).toLocaleString()}円）</span>
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
                        <label>退職金額</label>
                        <input
                            type="number"
                            value={retirementAmount}
                            onChange={(e) => setRetirementAmount(Number(e.target.value))}
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
