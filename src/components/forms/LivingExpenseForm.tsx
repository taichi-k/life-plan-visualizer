import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { LivingExpense, UtilityExpense, CommunicationExpense, MedicalExpense, AllowanceExpense } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, ShoppingCart, Zap, Wifi, Heart, Wallet } from 'lucide-react';

type TabType = 'living' | 'utility' | 'communication' | 'medical' | 'allowance';

export const LivingExpenseForm: React.FC = () => {
    const { family, expenses, addExpense, removeExpense, settings } = useAppStore();
    const [activeTab, setActiveTab] = useState<TabType>('living');

    const livingExpenses = expenses.filter(e => e.category === 'living') as LivingExpense[];
    const utilityExpenses = expenses.filter(e => e.category === 'utility') as UtilityExpense[];
    const communicationExpenses = expenses.filter(e => e.category === 'communication') as CommunicationExpense[];
    const medicalExpenses = expenses.filter(e => e.category === 'medical') as MedicalExpense[];
    const allowanceExpenses = expenses.filter(e => e.category === 'allowance') as AllowanceExpense[];

    // 生活費
    const [livingName, setLivingName] = useState('食費');
    const [livingSubcategory, setLivingSubcategory] = useState<'food' | 'daily' | 'entertainment' | 'clothing' | 'other'>('food');
    const [livingMonthly, setLivingMonthly] = useState(60000);
    const [livingStartYear, setLivingStartYear] = useState(settings.calculationStartYear);
    const [livingEndYear, setLivingEndYear] = useState(settings.calculationEndYear);

    // 光熱費
    const [electricityMonthly, setElectricityMonthly] = useState(12000);
    const [gasMonthly, setGasMonthly] = useState(8000);
    const [waterMonthly, setWaterMonthly] = useState(5000);
    const [utilityStartYear, setUtilityStartYear] = useState(settings.calculationStartYear);
    const [utilityEndYear, setUtilityEndYear] = useState(settings.calculationEndYear);

    // 通信費
    const [internetMonthly, setInternetMonthly] = useState(5000);
    const [mobileMonthly, setMobileMonthly] = useState(15000);
    const [subscriptionsMonthly, setSubscriptionsMonthly] = useState(3000);
    const [communicationStartYear, setCommunicationStartYear] = useState(settings.calculationStartYear);
    const [communicationEndYear, setCommunicationEndYear] = useState(settings.calculationEndYear);

    // 医療費
    const [medicalMonthly, setMedicalMonthly] = useState(10000);
    const [medicalStartYear, setMedicalStartYear] = useState(settings.calculationStartYear);
    const [medicalEndYear, setMedicalEndYear] = useState(settings.calculationEndYear);

    // お小遣い
    const [allowanceOwnerId, setAllowanceOwnerId] = useState(family.find(f => f.role === 'husband')?.id || '');
    const [allowanceMonthly, setAllowanceMonthly] = useState(30000);
    const [allowanceStartYear, setAllowanceStartYear] = useState(settings.calculationStartYear);
    const [allowanceEndYear, setAllowanceEndYear] = useState(settings.calculationEndYear);

    const handleAddLiving = () => {
        const living: LivingExpense = {
            id: crypto.randomUUID(),
            category: 'living',
            name: livingName,
            subcategory: livingSubcategory,
            monthlyAmount: livingMonthly,
            startYear: livingStartYear,
            endYear: livingEndYear,
        };
        addExpense(living);
    };

    const handleAddUtility = () => {
        const utility: UtilityExpense = {
            id: crypto.randomUUID(),
            category: 'utility',
            name: '光熱費',
            electricityMonthly,
            gasMonthly,
            waterMonthly,
            startYear: utilityStartYear,
            endYear: utilityEndYear,
        };
        addExpense(utility);
    };

    const handleAddCommunication = () => {
        const comm: CommunicationExpense = {
            id: crypto.randomUUID(),
            category: 'communication',
            name: '通信費',
            internetMonthly,
            mobileMonthly,
            subscriptionsMonthly,
            startYear: communicationStartYear,
            endYear: communicationEndYear,
        };
        addExpense(comm);
    };

    const handleAddMedical = () => {
        const medical: MedicalExpense = {
            id: crypto.randomUUID(),
            category: 'medical',
            name: '医療費',
            monthlyAmount: medicalMonthly,
            startYear: medicalStartYear,
            endYear: medicalEndYear,
        };
        addExpense(medical);
    };

    const handleAddAllowance = () => {
        const owner = family.find(f => f.id === allowanceOwnerId);
        const allowance: AllowanceExpense = {
            id: crypto.randomUUID(),
            category: 'allowance',
            name: `${owner?.name || ''}のお小遣い`,
            ownerId: allowanceOwnerId,
            monthlyAmount: allowanceMonthly,
            startYear: allowanceStartYear,
            endYear: allowanceEndYear,
        };
        addExpense(allowance);
    };

    const tabs = [
        { id: 'living' as TabType, label: '食費・日用品', icon: ShoppingCart },
        { id: 'utility' as TabType, label: '光熱費', icon: Zap },
        { id: 'communication' as TabType, label: '通信費', icon: Wifi },
        { id: 'medical' as TabType, label: '医療費', icon: Heart },
        { id: 'allowance' as TabType, label: 'お小遣い', icon: Wallet },
    ];

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

            {/* 生活費タブ */}
            {activeTab === 'living' && (
                <>
                    <div className={styles.list}>
                        {livingExpenses.map(item => (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>{item.monthlyAmount.toLocaleString()}円/月</span>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {livingExpenses.length === 0 && <div className={styles.emptyState}>生活費はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>生活費を追加</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>名称</label>
                                <input type="text" value={livingName} onChange={(e) => setLivingName(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>カテゴリ</label>
                                <select value={livingSubcategory} onChange={(e) => setLivingSubcategory(e.target.value as any)}>
                                    <option value="food">食費</option>
                                    <option value="daily">日用品</option>
                                    <option value="entertainment">娯楽費</option>
                                    <option value="clothing">被服費</option>
                                    <option value="other">その他</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>月額</label>
                            <input type="number" value={livingMonthly} onChange={(e) => setLivingMonthly(Number(e.target.value))} />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>開始年</label>
                                <input type="number" value={livingStartYear} onChange={(e) => setLivingStartYear(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>終了年</label>
                                <input type="number" value={livingEndYear} onChange={(e) => setLivingEndYear(Number(e.target.value))} />
                            </div>
                        </div>
                        <button className={styles.addBtn} onClick={handleAddLiving}>
                            <Plus size={18} /> 追加
                        </button>
                    </div>
                </>
            )}

            {/* 光熱費タブ */}
            {activeTab === 'utility' && (
                <>
                    <div className={styles.list}>
                        {utilityExpenses.map(item => (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        電気{item.electricityMonthly?.toLocaleString()} + ガス{item.gasMonthly?.toLocaleString()} + 水道{item.waterMonthly?.toLocaleString()}円/月
                                        {item.startYear && item.endYear && ` (${item.startYear}〜${item.endYear}年)`}
                                    </span>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {utilityExpenses.length === 0 && <div className={styles.emptyState}>光熱費はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>光熱費を追加</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>電気代（月額）</label>
                                <input type="number" value={electricityMonthly} onChange={(e) => setElectricityMonthly(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>ガス代（月額）</label>
                                <input type="number" value={gasMonthly} onChange={(e) => setGasMonthly(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>水道代（月額）</label>
                                <input type="number" value={waterMonthly} onChange={(e) => setWaterMonthly(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>開始年</label>
                                <input type="number" value={utilityStartYear} onChange={(e) => setUtilityStartYear(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>終了年</label>
                                <input type="number" value={utilityEndYear} onChange={(e) => setUtilityEndYear(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.previewBox}>
                            <span>合計: <strong>{(electricityMonthly + gasMonthly + waterMonthly).toLocaleString()}円/月</strong></span>
                        </div>
                        <button className={styles.addBtn} onClick={handleAddUtility}>
                            <Plus size={18} /> 追加
                        </button>
                    </div>
                </>
            )}

            {/* 通信費タブ */}
            {activeTab === 'communication' && (
                <>
                    <div className={styles.list}>
                        {communicationExpenses.map(item => (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {((item.internetMonthly || 0) + (item.mobileMonthly || 0) + (item.subscriptionsMonthly || 0)).toLocaleString()}円/月
                                        {item.startYear && item.endYear && ` (${item.startYear}〜${item.endYear}年)`}
                                    </span>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {communicationExpenses.length === 0 && <div className={styles.emptyState}>通信費はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>通信費を追加</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>インターネット（月額）</label>
                                <input type="number" value={internetMonthly} onChange={(e) => setInternetMonthly(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>携帯電話（世帯合計）</label>
                                <input type="number" value={mobileMonthly} onChange={(e) => setMobileMonthly(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>サブスク等（月額）</label>
                            <input type="number" value={subscriptionsMonthly} onChange={(e) => setSubscriptionsMonthly(Number(e.target.value))} />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>開始年</label>
                                <input type="number" value={communicationStartYear} onChange={(e) => setCommunicationStartYear(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>終了年</label>
                                <input type="number" value={communicationEndYear} onChange={(e) => setCommunicationEndYear(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.previewBox}>
                            <span>合計: <strong>{(internetMonthly + mobileMonthly + subscriptionsMonthly).toLocaleString()}円/月</strong></span>
                        </div>
                        <button className={styles.addBtn} onClick={handleAddCommunication}>
                            <Plus size={18} /> 追加
                        </button>
                    </div>
                </>
            )}

            {/* 医療費タブ */}
            {activeTab === 'medical' && (
                <>
                    <div className={styles.list}>
                        {medicalExpenses.map(item => (
                            <div key={item.id} className={styles.listItem}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {item.monthlyAmount.toLocaleString()}円/月
                                        {item.startYear && item.endYear && ` (${item.startYear}〜${item.endYear}年)`}
                                    </span>
                                </div>
                                <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {medicalExpenses.length === 0 && <div className={styles.emptyState}>医療費はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>医療費を追加</h3>
                        <div className={styles.formGroup}>
                            <label>月額医療費</label>
                            <input type="number" value={medicalMonthly} onChange={(e) => setMedicalMonthly(Number(e.target.value))} />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>開始年</label>
                                <input type="number" value={medicalStartYear} onChange={(e) => setMedicalStartYear(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>終了年</label>
                                <input type="number" value={medicalEndYear} onChange={(e) => setMedicalEndYear(Number(e.target.value))} />
                            </div>
                        </div>
                        <button className={styles.addBtn} onClick={handleAddMedical}>
                            <Plus size={18} /> 追加
                        </button>
                    </div>
                </>
            )}

            {/* お小遣いタブ */}
            {activeTab === 'allowance' && (
                <>
                    <div className={styles.list}>
                        {allowanceExpenses.map(item => {
                            const owner = family.find(f => f.id === item.ownerId);
                            return (
                                <div key={item.id} className={styles.listItem}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemDetail}>
                                            {owner?.name} | {item.monthlyAmount.toLocaleString()}円/月
                                            {item.startYear && item.endYear && ` (${item.startYear}〜${item.endYear}年)`}
                                        </span>
                                    </div>
                                    <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}
                        {allowanceExpenses.length === 0 && <div className={styles.emptyState}>お小遣いはまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>お小遣いを追加</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>対象者</label>
                                <select value={allowanceOwnerId} onChange={(e) => setAllowanceOwnerId(e.target.value)}>
                                    {family.filter(f => f.role !== 'child').map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>月額</label>
                                <input type="number" value={allowanceMonthly} onChange={(e) => setAllowanceMonthly(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>開始年</label>
                                <input type="number" value={allowanceStartYear} onChange={(e) => setAllowanceStartYear(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>終了年</label>
                                <input type="number" value={allowanceEndYear} onChange={(e) => setAllowanceEndYear(Number(e.target.value))} />
                            </div>
                        </div>
                        <button className={styles.addBtn} onClick={handleAddAllowance}>
                            <Plus size={18} /> 追加
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
