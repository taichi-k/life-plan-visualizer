import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { InsuranceExpense, TaxExpense, CarExpense } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Shield, Receipt, Car } from 'lucide-react';

type TabType = 'insurance' | 'tax' | 'car';

export const InsuranceCarForm: React.FC = () => {
    const { expenses, addExpense, removeExpense, settings } = useAppStore();
    const [activeTab, setActiveTab] = useState<TabType>('insurance');

    const insuranceExpenses = expenses.filter(e => e.category === 'insurance') as InsuranceExpense[];
    const taxExpenses = expenses.filter(e => e.category === 'tax') as TaxExpense[];
    const carExpenses = expenses.filter(e => e.category === 'car') as CarExpense[];

    // 保険
    const [insuranceName, setInsuranceName] = useState('生命保険');
    const [insuranceType, setInsuranceType] = useState<'life' | 'medical' | 'cancer' | 'income' | 'other'>('life');
    const [insuranceMonthly, setInsuranceMonthly] = useState(15000);
    const [insuranceStartYear, setInsuranceStartYear] = useState(settings.calculationStartYear);
    const [insuranceEndYear, setInsuranceEndYear] = useState(settings.calculationEndYear);

    // 税金
    const [useAutoTax, setUseAutoTax] = useState(true);
    const [customTaxAmount, setCustomTaxAmount] = useState(1000000);

    // 車
    const [hasCar, setHasCar] = useState(true);
    const [carPurchasePrice, setCarPurchasePrice] = useState(3000000);
    const [carPurchaseYear, setCarPurchaseYear] = useState(settings.calculationStartYear);
    const [carReplacementInterval, setCarReplacementInterval] = useState(10);
    const [carTaxYearly, setCarTaxYearly] = useState(40000);
    const [carInsuranceYearly, setCarInsuranceYearly] = useState(80000);
    const [carMaintenanceYearly, setCarMaintenanceYearly] = useState(100000);
    const [carGasMonthly, setCarGasMonthly] = useState(15000);
    const [carParkingMonthly, setCarParkingMonthly] = useState(15000);

    const handleAddInsurance = () => {
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
    };

    const handleAddTax = () => {
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

    const handleAddCar = () => {
        const car: CarExpense = {
            id: crypto.randomUUID(),
            category: 'car',
            name: '自動車関連費',
            hasCar,
            purchasePrice: carPurchasePrice,
            purchaseYear: carPurchaseYear,
            replacementInterval: carReplacementInterval,
            taxYearly: carTaxYearly,
            insuranceYearly: carInsuranceYearly,
            maintenanceYearly: carMaintenanceYearly,
            gasMonthly: carGasMonthly,
            parkingMonthly: carParkingMonthly,
            startYear: carPurchaseYear,
        };
        addExpense(car);
    };

    const tabs = [
        { id: 'insurance' as TabType, label: '保険', icon: Shield },
        { id: 'tax' as TabType, label: '税金・社会保険', icon: Receipt },
        { id: 'car' as TabType, label: '自動車', icon: Car },
    ];

    // 車の年間維持費計算
    const carYearlyCost = carTaxYearly + carInsuranceYearly + carMaintenanceYearly + (carGasMonthly + carParkingMonthly) * 12;

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
                                        {item.insuranceType} | {item.monthlyPremium.toLocaleString()}円/月
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
                            <label>月額保険料</label>
                            <input type="number" value={insuranceMonthly} onChange={(e) => setInsuranceMonthly(Number(e.target.value))} />
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
                                        {item.useAutoCalculation ? '自動計算（収入の約20%）' : `${item.customAmount?.toLocaleString()}円/年`}
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
                                <label>年間税金・社会保険額</label>
                                <input type="number" value={customTaxAmount} onChange={(e) => setCustomTaxAmount(Number(e.target.value))} />
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
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {item.hasCar ? `${item.replacementInterval}年ごと買い替え` : '車なし'}
                                    </span>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                    <Trash2 size={18} />
                                </button>
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
                                        <label>購入価格</label>
                                        <input type="number" value={carPurchasePrice} onChange={(e) => setCarPurchasePrice(Number(e.target.value))} />
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
                                        <label>自動車税（年額）</label>
                                        <input type="number" value={carTaxYearly} onChange={(e) => setCarTaxYearly(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>自動車保険（年額）</label>
                                        <input type="number" value={carInsuranceYearly} onChange={(e) => setCarInsuranceYearly(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>車検・整備費（年平均）</label>
                                        <input type="number" value={carMaintenanceYearly} onChange={(e) => setCarMaintenanceYearly(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>ガソリン代（月額）</label>
                                        <input type="number" value={carGasMonthly} onChange={(e) => setCarGasMonthly(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>駐車場代（月額）</label>
                                        <input type="number" value={carParkingMonthly} onChange={(e) => setCarParkingMonthly(Number(e.target.value))} />
                                    </div>
                                </div>

                                <div className={styles.previewBox}>
                                    <span>年間維持費: <strong>{carYearlyCost.toLocaleString()}円</strong></span>
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
