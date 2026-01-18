import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { HousingExpense, VariableRatePeriod } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Home, Calculator, Edit2, X, Check } from 'lucide-react';

export const HousingForm: React.FC = () => {
    const { expenses, addExpense, removeExpense, updateExpense, settings } = useAppStore();
    const housingExpenses = expenses.filter(e => e.category === 'housing') as HousingExpense[];

    // 編集モード
    const [editingId, setEditingId] = useState<string | null>(null);

    const [name, setName] = useState('住宅費');
    const [housingType, setHousingType] = useState<'rent' | 'owned-loan' | 'owned-paid'>('rent');

    // 賃貸
    const [monthlyRent, setMonthlyRent] = useState(100000);
    const [rentStartYear, setRentStartYear] = useState(settings.calculationStartYear);
    const [rentEndYear, setRentEndYear] = useState(settings.calculationEndYear);

    // ローン
    const [loanAmount, setLoanAmount] = useState(35000000);
    const [loanInterestRate, setLoanInterestRate] = useState(0.5);
    const [loanYears, setLoanYears] = useState(35);
    const [loanStartYear, setLoanStartYear] = useState(settings.calculationStartYear);
    
    // 変動金利設定
    const [isVariableRate, setIsVariableRate] = useState(false);
    const [variableRatePeriods, setVariableRatePeriods] = useState<VariableRatePeriod[]>([
        { startYear: settings.calculationStartYear, endYear: settings.calculationStartYear + 10, interestRate: 0.5 },
    ]);

    // 持ち家共通
    const [propertyTaxYearly, setPropertyTaxYearly] = useState(120000);
    const [isApartment, setIsApartment] = useState(false);
    const [managementFeeMonthly, setManagementFeeMonthly] = useState(15000);
    const [repairReserveFundMonthly, setRepairReserveFundMonthly] = useState(12000);

    // 修繕
    const [majorRepairCost, setMajorRepairCost] = useState(1500000);
    const [majorRepairInterval, setMajorRepairInterval] = useState(15);
    const [majorRepairStartYear, setMajorRepairStartYear] = useState(settings.calculationStartYear + 15);

    // 火災保険
    const [fireInsuranceYearly, setFireInsuranceYearly] = useState(20000);

    // ローン返済額のプレビュー計算
    const calculateMortgagePreview = (): { monthly: number; yearly: number; total: number } => {
        const rate = isVariableRate && variableRatePeriods.length > 0 
            ? variableRatePeriods[0].interestRate 
            : loanInterestRate;
        if (rate === 0) {
            const yearly = loanAmount / loanYears;
            return { monthly: Math.round(yearly / 12), yearly, total: loanAmount };
        }
        const monthlyRate = rate / 100 / 12;
        const totalMonths = loanYears * 12;
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        return {
            monthly: Math.round(monthlyPayment),
            yearly: Math.round(monthlyPayment * 12),
            total: Math.round(monthlyPayment * totalMonths)
        };
    };

    // 変動金利期間の追加
    const addVariableRatePeriod = () => {
        const lastPeriod = variableRatePeriods[variableRatePeriods.length - 1];
        const newStartYear = lastPeriod ? lastPeriod.endYear + 1 : loanStartYear;
        setVariableRatePeriods([
            ...variableRatePeriods,
            { startYear: newStartYear, endYear: newStartYear + 5, interestRate: 1.0 }
        ]);
    };

    // 変動金利期間の更新
    const updateVariableRatePeriod = (index: number, field: keyof VariableRatePeriod, value: number) => {
        const updated = [...variableRatePeriods];
        updated[index] = { ...updated[index], [field]: value };
        setVariableRatePeriods(updated);
    };

    // 変動金利期間の削除
    const removeVariableRatePeriod = (index: number) => {
        setVariableRatePeriods(variableRatePeriods.filter((_, i) => i !== index));
    };

    // 編集開始
    const startEdit = (item: HousingExpense) => {
        setEditingId(item.id);
        setName(item.name);
        setHousingType(item.housingType);
        // 賃貸
        setMonthlyRent(item.monthlyRent || 100000);
        setRentStartYear(item.rentStartYear || settings.calculationStartYear);
        setRentEndYear(item.rentEndYear || settings.calculationEndYear);
        // ローン
        setLoanAmount(item.loanAmount || 35000000);
        setLoanInterestRate(item.loanInterestRate || 0.5);
        setLoanYears(item.loanYears || 35);
        setLoanStartYear(item.loanStartYear || settings.calculationStartYear);
        // 変動金利
        setIsVariableRate(item.isVariableRate || false);
        setVariableRatePeriods(item.variableRatePeriods || [
            { startYear: settings.calculationStartYear, endYear: settings.calculationStartYear + 10, interestRate: 0.5 },
        ]);
        // 持ち家共通
        setPropertyTaxYearly(item.propertyTaxYearly || 120000);
        setIsApartment(item.isApartment || false);
        setManagementFeeMonthly(item.managementFeeMonthly || 15000);
        setRepairReserveFundMonthly(item.repairReserveFundMonthly || 12000);
        // 修繕
        setMajorRepairCost(item.majorRepairCost || 1500000);
        setMajorRepairInterval(item.majorRepairInterval || 15);
        setMajorRepairStartYear(item.majorRepairStartYear || settings.calculationStartYear + 15);
        // 火災保険
        setFireInsuranceYearly(item.fireInsuranceYearly || 20000);
    };

    // 編集キャンセル
    const cancelEdit = () => {
        setEditingId(null);
        // デフォルト値にリセット
        setName('住宅費');
        setHousingType('rent');
        setMonthlyRent(100000);
        setRentStartYear(settings.calculationStartYear);
        setRentEndYear(settings.calculationEndYear);
        setLoanAmount(35000000);
        setLoanInterestRate(0.5);
        setLoanYears(35);
        setLoanStartYear(settings.calculationStartYear);
        setIsVariableRate(false);
        setVariableRatePeriods([
            { startYear: settings.calculationStartYear, endYear: settings.calculationStartYear + 10, interestRate: 0.5 },
        ]);
        setPropertyTaxYearly(120000);
        setIsApartment(false);
        setManagementFeeMonthly(15000);
        setRepairReserveFundMonthly(12000);
        setMajorRepairCost(1500000);
        setMajorRepairInterval(15);
        setMajorRepairStartYear(settings.calculationStartYear + 15);
        setFireInsuranceYearly(20000);
    };

    // 編集保存
    const saveEdit = () => {
        if (!editingId) return;
        const housing: Partial<HousingExpense> = {
            name,
            housingType,
            // 賃貸
            monthlyRent: housingType === 'rent' ? monthlyRent : undefined,
            rentStartYear: housingType === 'rent' ? rentStartYear : undefined,
            rentEndYear: housingType === 'rent' ? rentEndYear : undefined,
            // ローン
            loanAmount: housingType === 'owned-loan' ? loanAmount : undefined,
            loanInterestRate: housingType === 'owned-loan' ? loanInterestRate : undefined,
            loanYears: housingType === 'owned-loan' ? loanYears : undefined,
            loanStartYear: housingType === 'owned-loan' ? loanStartYear : undefined,
            // 変動金利
            isVariableRate: housingType === 'owned-loan' ? isVariableRate : undefined,
            variableRatePeriods: housingType === 'owned-loan' && isVariableRate ? variableRatePeriods : undefined,
            // 持ち家共通
            propertyTaxYearly: housingType !== 'rent' ? propertyTaxYearly : undefined,
            isApartment: housingType !== 'rent' ? isApartment : undefined,
            managementFeeMonthly: housingType !== 'rent' && isApartment ? managementFeeMonthly : undefined,
            repairReserveFundMonthly: housingType !== 'rent' && isApartment ? repairReserveFundMonthly : undefined,
            majorRepairCost: housingType !== 'rent' ? majorRepairCost : undefined,
            majorRepairInterval: housingType !== 'rent' ? majorRepairInterval : undefined,
            majorRepairStartYear: housingType !== 'rent' ? majorRepairStartYear : undefined,
            fireInsuranceYearly: housingType !== 'rent' ? fireInsuranceYearly : undefined,
        };
        updateExpense(editingId, housing);
        cancelEdit();
    };

    const handleAdd = () => {
        const housing: HousingExpense = {
            id: crypto.randomUUID(),
            category: 'housing',
            name,
            housingType,
            // 賃貸
            monthlyRent: housingType === 'rent' ? monthlyRent : undefined,
            rentStartYear: housingType === 'rent' ? rentStartYear : undefined,
            rentEndYear: housingType === 'rent' ? rentEndYear : undefined,
            // ローン
            loanAmount: housingType === 'owned-loan' ? loanAmount : undefined,
            loanInterestRate: housingType === 'owned-loan' ? loanInterestRate : undefined,
            loanYears: housingType === 'owned-loan' ? loanYears : undefined,
            loanStartYear: housingType === 'owned-loan' ? loanStartYear : undefined,
            // 変動金利
            isVariableRate: housingType === 'owned-loan' ? isVariableRate : undefined,
            variableRatePeriods: housingType === 'owned-loan' && isVariableRate ? variableRatePeriods : undefined,
            // 持ち家共通
            propertyTaxYearly: housingType !== 'rent' ? propertyTaxYearly : undefined,
            isApartment: housingType !== 'rent' ? isApartment : undefined,
            managementFeeMonthly: housingType !== 'rent' && isApartment ? managementFeeMonthly : undefined,
            repairReserveFundMonthly: housingType !== 'rent' && isApartment ? repairReserveFundMonthly : undefined,
            majorRepairCost: housingType !== 'rent' ? majorRepairCost : undefined,
            majorRepairInterval: housingType !== 'rent' ? majorRepairInterval : undefined,
            majorRepairStartYear: housingType !== 'rent' ? majorRepairStartYear : undefined,
            fireInsuranceYearly: housingType !== 'rent' ? fireInsuranceYearly : undefined,
        };
        addExpense(housing);
    };

    const mortgage = calculateMortgagePreview();

    return (
        <div className={styles.container}>
            <div className={styles.helpText}>
                <Home size={16} />
                <span>住宅費には、ローン・賃料だけでなく、固定資産税、管理費、修繕費、火災保険も含めて計算します。</span>
            </div>

            <div className={styles.list}>
                {housingExpenses.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemDetail}>
                                {item.housingType === 'rent' ? '賃貸' : item.housingType === 'owned-loan' ? '持ち家(ローン)' : '持ち家(完済済)'}
                                {item.housingType === 'rent' && item.monthlyRent && ` | ${item.monthlyRent.toLocaleString()}円/月`}
                                {item.housingType === 'owned-loan' && item.loanAmount && ` | ${(item.loanAmount / 10000).toLocaleString()}万円`}
                            </span>
                        </div>
                        <div className={styles.itemActions}>
                            <button className={styles.editBtn} onClick={() => startEdit(item)} title="編集">
                                <Edit2 size={16} />
                            </button>
                            <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)} title="削除">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {housingExpenses.length === 0 && <div className={styles.emptyState}>住宅費はまだ登録されていません。</div>}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>{editingId ? '住宅費を編集' : '住宅費を追加'}</h3>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>名称</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>住宅タイプ</label>
                        <select value={housingType} onChange={(e) => setHousingType(e.target.value as any)}>
                            <option value="rent">賃貸</option>
                            <option value="owned-loan">持ち家（ローン返済中）</option>
                            <option value="owned-paid">持ち家（ローン完済済み）</option>
                        </select>
                    </div>
                </div>

                {/* 賃貸の場合 */}
                {housingType === 'rent' && (
                    <>
                        <div className={styles.formGroup}>
                            <label>月額家賃</label>
                            <input
                                type="number"
                                value={monthlyRent}
                                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>開始年</label>
                                <input
                                    type="number"
                                    value={rentStartYear}
                                    onChange={(e) => setRentStartYear(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>終了年</label>
                                <input
                                    type="number"
                                    value={rentEndYear}
                                    onChange={(e) => setRentEndYear(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* ローンの場合 */}
                {housingType === 'owned-loan' && (
                    <>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>借入額（円）</label>
                                <input
                                    type="number"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>返済期間（年）</label>
                                <input
                                    type="number"
                                    value={loanYears}
                                    onChange={(e) => setLoanYears(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ローン開始年</label>
                            <input
                                type="number"
                                value={loanStartYear}
                                onChange={(e) => setLoanStartYear(Number(e.target.value))}
                            />
                        </div>

                        {/* 変動金利オプション */}
                        <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={isVariableRate}
                                onChange={(e) => setIsVariableRate(e.target.checked)}
                                style={{ width: 'auto', marginRight: '8px' }}
                            />
                            <label style={{ marginBottom: 0 }}>変動金利（期間・金利を複数設定）</label>
                        </div>

                        {!isVariableRate && (
                            <div className={styles.formGroup}>
                                <label>金利（%）- 固定</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={loanInterestRate}
                                    onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                                />
                            </div>
                        )}

                        {isVariableRate && (
                            <div className={styles.formGroup}>
                                <label>変動金利期間設定</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                    {variableRatePeriods.map((period, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '11px', color: '#888' }}>開始年</label>
                                                <input
                                                    type="number"
                                                    value={period.startYear}
                                                    onChange={(e) => updateVariableRatePeriod(index, 'startYear', Number(e.target.value))}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '11px', color: '#888' }}>終了年</label>
                                                <input
                                                    type="number"
                                                    value={period.endYear}
                                                    onChange={(e) => updateVariableRatePeriod(index, 'endYear', Number(e.target.value))}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '11px', color: '#888' }}>金利(%)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={period.interestRate}
                                                    onChange={(e) => updateVariableRatePeriod(index, 'interestRate', Number(e.target.value))}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            {variableRatePeriods.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariableRatePeriod(index)}
                                                    style={{ padding: '4px 8px', background: '#ff7675', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addVariableRatePeriod}
                                        style={{ padding: '8px', background: '#74b9ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                    >
                                        <Plus size={14} /> 期間を追加
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.previewBox}>
                            <Calculator size={16} />
                            <span>月々返済{isVariableRate ? '(初期)' : ''}: <strong>{mortgage.monthly.toLocaleString()}円</strong></span>
                            <span>年間: {mortgage.yearly.toLocaleString()}円</span>
                            {!isVariableRate && <span>総支払額: {mortgage.total.toLocaleString()}円</span>}
                            {isVariableRate && <span style={{ color: '#888', fontSize: '11px' }}>※変動金利のため総支払額は目安です</span>}
                        </div>
                    </>
                )}

                {/* 持ち家共通 */}
                {housingType !== 'rent' && (
                    <>
                        <div className={styles.formGroup}>
                            <label>固定資産税（年額）</label>
                            <input
                                type="number"
                                value={propertyTaxYearly}
                                onChange={(e) => setPropertyTaxYearly(Number(e.target.value))}
                            />
                        </div>

                        <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={isApartment}
                                onChange={(e) => setIsApartment(e.target.checked)}
                                style={{ width: 'auto', marginRight: '8px' }}
                            />
                            <label style={{ marginBottom: 0 }}>マンション（管理費・修繕積立金あり）</label>
                        </div>

                        {isApartment && (
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>管理費（月額）</label>
                                    <input
                                        type="number"
                                        value={managementFeeMonthly}
                                        onChange={(e) => setManagementFeeMonthly(Number(e.target.value))}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>修繕積立金（月額）</label>
                                    <input
                                        type="number"
                                        value={repairReserveFundMonthly}
                                        onChange={(e) => setRepairReserveFundMonthly(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.sectionTitle}>大規模修繕（戸建・マンション共通）</div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>修繕費用（1回あたり）</label>
                                <input
                                    type="number"
                                    value={majorRepairCost}
                                    onChange={(e) => setMajorRepairCost(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>修繕間隔（年）</label>
                                <input
                                    type="number"
                                    value={majorRepairInterval}
                                    onChange={(e) => setMajorRepairInterval(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>初回修繕年</label>
                            <input
                                type="number"
                                value={majorRepairStartYear}
                                onChange={(e) => setMajorRepairStartYear(Number(e.target.value))}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>火災保険（年額）</label>
                            <input
                                type="number"
                                value={fireInsuranceYearly}
                                onChange={(e) => setFireInsuranceYearly(Number(e.target.value))}
                            />
                        </div>
                    </>
                )}

                {editingId ? (
                    <div className={styles.editActions}>
                        <button className={styles.saveBtn} onClick={saveEdit}>
                            <Check size={16} /> 保存
                        </button>
                        <button className={styles.cancelBtn} onClick={cancelEdit}>
                            <X size={16} /> キャンセル
                        </button>
                    </div>
                ) : (
                    <button className={styles.addBtn} onClick={handleAdd}>
                        <Plus size={18} />
                        住宅費を追加
                    </button>
                )}
            </div>
        </div>
    );
};
