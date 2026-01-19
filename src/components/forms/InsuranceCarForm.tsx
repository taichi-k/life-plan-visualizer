import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { InsuranceExpense, TaxExpense, CarExpense } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Shield, Receipt, Car, Edit2, Check, X } from 'lucide-react';

// 万円 <-> 円 変換ヘルパー
const toMan = (yen: number) => yen / 10000;
const toYen = (man: number) => man * 10000;

type TabType = 'insurance' | 'tax' | 'car';

export const InsuranceCarForm: React.FC = () => {
    const { expenses, addExpense, removeExpense, updateExpense, settings } = useAppStore();
    const [activeTab, setActiveTab] = useState<TabType>('insurance');

    const insuranceExpenses = expenses.filter(e => e.category === 'insurance') as InsuranceExpense[];
    const taxExpenses = expenses.filter(e => e.category === 'tax') as TaxExpense[];
    const carExpenses = expenses.filter(e => e.category === 'car') as CarExpense[];
    
    // デバッグ用
    console.log('Car expenses from store:', carExpenses);

    // 保険 (万円単位)
    const [insuranceName, setInsuranceName] = useState('生命保険');
    const [insuranceType, setInsuranceType] = useState<'life' | 'medical' | 'cancer' | 'income' | 'other'>('life');
    const [insuranceMonthlyMan, setInsuranceMonthlyMan] = useState(1.5);
    const [insuranceStartYear, setInsuranceStartYear] = useState(settings.calculationStartYear);
    const [insuranceEndYear, setInsuranceEndYear] = useState(settings.calculationEndYear);

    // 税金 (万円単位)
    const [useAutoTax, setUseAutoTax] = useState(true);
    const [customTaxAmountMan, setCustomTaxAmountMan] = useState(100);

    // 車 (万円単位)
    const [hasCar, setHasCar] = useState(true);
    const [carPurchasePriceMan, setCarPurchasePriceMan] = useState(300);
    const [carPurchaseYear, setCarPurchaseYear] = useState(settings.calculationStartYear);
    const [carReplacementInterval, setCarReplacementInterval] = useState(10);
    const [carTaxYearlyMan, setCarTaxYearlyMan] = useState(4);
    const [carInsuranceYearlyMan, setCarInsuranceYearlyMan] = useState(8);
    const [carMaintenanceYearlyMan, setCarMaintenanceYearlyMan] = useState(10);
    const [carGasMonthlyMan, setCarGasMonthlyMan] = useState(1.5);
    const [carParkingMonthlyMan, setCarParkingMonthlyMan] = useState(1.5);

    // 編集用の状態
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Record<string, any>>({});

    // 編集開始
    const startEdit = (item: any) => {
        setEditingId(item.id);
        setEditData({ ...item });
    };

    // 編集キャンセル
    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    // 編集保存
    const saveEdit = () => {
        if (!editingId) return;
        console.log('Saving car expense:', editingId, editData);
        updateExpense(editingId, editData);
        setEditingId(null);
        setEditData({});
    };

    const handleAddInsurance = () => {
        const insurance: InsuranceExpense = {
            id: crypto.randomUUID(),
            category: 'insurance',
            name: insuranceName,
            insuranceType,
            monthlyPremium: toYen(insuranceMonthlyMan),
            startYear: insuranceStartYear,
            endYear: insuranceEndYear,
        };
        addExpense(insurance);
    };

    const handleAddTax = () => {
        const tax: TaxExpense = {
            id: crypto.randomUUID(),
            category: 'tax',
            name: '税金・社会保険',
            useAutoCalculation: useAutoTax,
            customAmount: useAutoTax ? undefined : toYen(customTaxAmountMan),
            customPeriodicity: 'yearly',
            startYear: settings.calculationStartYear,
        };
        addExpense(tax);
    };

    const handleAddCar = () => {
        const car: CarExpense = {
            id: crypto.randomUUID(),
            category: 'car',
            name: '自動車関連費',
            hasCar,
            purchasePrice: toYen(carPurchasePriceMan),
            purchaseYear: carPurchaseYear,
            replacementInterval: carReplacementInterval,
            taxYearly: toYen(carTaxYearlyMan),
            insuranceYearly: toYen(carInsuranceYearlyMan),
            maintenanceYearly: toYen(carMaintenanceYearlyMan),
            gasMonthly: toYen(carGasMonthlyMan),
            parkingMonthly: toYen(carParkingMonthlyMan),
            startYear: carPurchaseYear,
        };
        addExpense(car);
    };

    const tabs = [
        { id: 'insurance' as TabType, label: '保険', icon: Shield },
        { id: 'tax' as TabType, label: '税金・社会保険', icon: Receipt },
        { id: 'car' as TabType, label: '自動車', icon: Car },
    ];

    // 車の年間維持費計算 (万円単位)
    const carYearlyCostMan = carTaxYearlyMan + carInsuranceYearlyMan + carMaintenanceYearlyMan + (carGasMonthlyMan + carParkingMonthlyMan) * 12;

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* 保険タブ */}
            {activeTab === 'insurance' && (
                <>
                    <div className={styles.list}>
                        {insuranceExpenses.map(item => (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {item.insuranceType} | {toMan(item.monthlyPremium).toFixed(1)}万円/月
                                    </span>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {insuranceExpenses.length === 0 && <div className={styles.emptyState}>保険はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>保険を追加</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>名称</label>
                                <input type="text" value={insuranceName} onChange={(e) => setInsuranceName(e.target.value)} />
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
                            <label>月額保険料 (万円)</label>
                            <input type="number" step="0.1" value={insuranceMonthlyMan} onChange={(e) => setInsuranceMonthlyMan(Number(e.target.value))} />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>開始年</label>
                                <input type="number" value={insuranceStartYear} onChange={(e) => setInsuranceStartYear(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>終了年</label>
                                <input type="number" value={insuranceEndYear} onChange={(e) => setInsuranceEndYear(Number(e.target.value))} />
                            </div>
                        </div>
                        <button className={styles.addBtn} onClick={handleAddInsurance}>
                            <Plus size={18} /> 追加
                        </button>
                    </div>
                </>
            )}

            {/* 税金タブ */}
            {activeTab === 'tax' && (
                <>
                    <div className={styles.list}>
                        {taxExpenses.map(item => (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {item.useAutoCalculation ? '自動計算（収入の約20%）' : `${item.customAmount ? toMan(item.customAmount).toFixed(1) : 0}万円/年`}
                                    </span>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {taxExpenses.length === 0 && <div className={styles.emptyState}>税金・社会保険はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>税金・社会保険を追加</h3>
                        <div className={styles.helpText}>
                            <Receipt size={16} />
                            <span>所得税、住民税、社会保険料を含みます。自動計算は収入の約20%で概算します。</span>
                        </div>
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
                                <label>年間税金・社会保険額 (万円)</label>
                                <input type="number" step="0.1" value={customTaxAmountMan} onChange={(e) => setCustomTaxAmountMan(Number(e.target.value))} />
                            </div>
                        )}
                        <button className={styles.addBtn} onClick={handleAddTax}>
                            <Plus size={18} /> 追加
                        </button>
                    </div>
                </>
            )}

            {/* 自動車タブ */}
            {activeTab === 'car' && (
                <>
                    <div className={styles.list}>
                        {carExpenses.map(item => (
                            <div key={item.id} className={styles.listItem}>
                                {editingId === item.id ? (
                                    <div className={styles.editFormFull}>
                                        <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={editData.hasCar ?? true}
                                                onChange={(e) => setEditData({...editData, hasCar: e.target.checked})}
                                                style={{ width: 'auto', marginRight: '8px' }}
                                            />
                                            <label style={{ marginBottom: 0 }}>自動車を保有している</label>
                                        </div>
                                        {editData.hasCar && (
                                            <>
                                                <div className={styles.sectionTitle}>車両購入</div>
                                                <div className={styles.row}>
                                                    <div className={styles.formGroup}>
                                                        <label>購入価格 (万円)</label>
                                                        <input type="number" step="0.1" value={toMan(editData.purchasePrice || 0)} onChange={(e) => setEditData({...editData, purchasePrice: toYen(Number(e.target.value))})} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>購入年</label>
                                                        <input type="number" value={editData.purchaseYear || settings.calculationStartYear} onChange={(e) => setEditData({...editData, purchaseYear: Number(e.target.value), startYear: Number(e.target.value)})} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>買い替え間隔（年）</label>
                                                        <input type="number" value={editData.replacementInterval || 10} onChange={(e) => setEditData({...editData, replacementInterval: Number(e.target.value)})} />
                                                    </div>
                                                </div>
                                                <div className={styles.sectionTitle}>維持費</div>
                                                <div className={styles.row}>
                                                    <div className={styles.formGroup}>
                                                        <label>自動車税（年額・万円）</label>
                                                        <input type="number" step="0.1" value={toMan(editData.taxYearly || 0)} onChange={(e) => setEditData({...editData, taxYearly: toYen(Number(e.target.value))})} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>自動車保険（年額・万円）</label>
                                                        <input type="number" step="0.1" value={toMan(editData.insuranceYearly || 0)} onChange={(e) => setEditData({...editData, insuranceYearly: toYen(Number(e.target.value))})} />
                                                    </div>
                                                </div>
                                                <div className={styles.row}>
                                                    <div className={styles.formGroup}>
                                                        <label>車検・整備費（年平均・万円）</label>
                                                        <input type="number" step="0.1" value={toMan(editData.maintenanceYearly || 0)} onChange={(e) => setEditData({...editData, maintenanceYearly: toYen(Number(e.target.value))})} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>ガソリン代（月額・万円）</label>
                                                        <input type="number" step="0.1" value={toMan(editData.gasMonthly || 0)} onChange={(e) => setEditData({...editData, gasMonthly: toYen(Number(e.target.value))})} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>駐車場代（月額・万円）</label>
                                                        <input type="number" step="0.1" value={toMan(editData.parkingMonthly || 0)} onChange={(e) => setEditData({...editData, parkingMonthly: toYen(Number(e.target.value))})} />
                                                    </div>
                                                </div>
                                                <div className={styles.previewBox}>
                                                    <span>年間維持費: <strong>{(toMan(editData.taxYearly || 0) + toMan(editData.insuranceYearly || 0) + toMan(editData.maintenanceYearly || 0) + (toMan(editData.gasMonthly || 0) + toMan(editData.parkingMonthly || 0)) * 12).toFixed(1)}万円</strong></span>
                                                </div>
                                            </>
                                        )}
                                        <div className={styles.editActions}>
                                            <button className={styles.saveBtn} onClick={saveEdit}><Check size={16} /> 保存</button>
                                            <button className={styles.cancelBtn} onClick={cancelEdit}><X size={16} /> キャンセル</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemName}>{item.name}</span>
                                            <span className={styles.itemDetail}>
                                                {item.hasCar ? `${item.replacementInterval}年ごと買い替え | 駐車場${toMan(item.parkingMonthly || 0).toFixed(1)}万円/月` : '車なし'}
                                            </span>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button className={styles.editBtn} onClick={() => startEdit(item)} title="編集">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {carExpenses.length === 0 && <div className={styles.emptyState}>自動車関連費はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>自動車関連費を追加</h3>
                        
                        <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={hasCar}
                                onChange={(e) => setHasCar(e.target.checked)}
                                style={{ width: 'auto', marginRight: '8px' }}
                            />
                            <label style={{ marginBottom: 0 }}>自動車を保有している</label>
                        </div>

                        {hasCar && (
                            <>
                                <div className={styles.sectionTitle}>車両購入</div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>購入価格 (万円)</label>
                                        <input type="number" step="0.1" value={carPurchasePriceMan} onChange={(e) => setCarPurchasePriceMan(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>購入年</label>
                                        <input type="number" value={carPurchaseYear} onChange={(e) => setCarPurchaseYear(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>買い替え間隔（年）</label>
                                        <input type="number" value={carReplacementInterval} onChange={(e) => setCarReplacementInterval(Number(e.target.value))} />
                                    </div>
                                </div>

                                <div className={styles.sectionTitle}>維持費</div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>自動車税（年額・万円）</label>
                                        <input type="number" step="0.1" value={carTaxYearlyMan} onChange={(e) => setCarTaxYearlyMan(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>自動車保険（年額・万円）</label>
                                        <input type="number" step="0.1" value={carInsuranceYearlyMan} onChange={(e) => setCarInsuranceYearlyMan(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>車検・整備費（年平均・万円）</label>
                                        <input type="number" step="0.1" value={carMaintenanceYearlyMan} onChange={(e) => setCarMaintenanceYearlyMan(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>ガソリン代（月額・万円）</label>
                                        <input type="number" step="0.1" value={carGasMonthlyMan} onChange={(e) => setCarGasMonthlyMan(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>駐車場代（月額・万円）</label>
                                        <input type="number" step="0.1" value={carParkingMonthlyMan} onChange={(e) => setCarParkingMonthlyMan(Number(e.target.value))} />
                                    </div>
                                </div>

                                <div className={styles.previewBox}>
                                    <span>年間維持費: <strong>{carYearlyCostMan.toFixed(1)}万円</strong></span>
                                    <span>（買い替え費用除く）</span>
                                </div>
                            </>
                        )}

                        <button className={styles.addBtn} onClick={handleAddCar}>
                            <Plus size={18} /> 追加
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
