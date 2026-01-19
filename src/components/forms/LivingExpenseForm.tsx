import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { LivingExpense, UtilityExpense, CommunicationExpense, MedicalExpense, AllowanceExpense } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, ShoppingCart, Zap, Wifi, Heart, Wallet, Edit2, Check, X } from 'lucide-react';

// 万円 <-> 円 変換ヘルパー
const toMan = (yen: number) => yen / 10000;
const toYen = (man: number) => man * 10000;

type TabType = 'living' | 'utility' | 'communication' | 'medical' | 'allowance';

export const LivingExpenseForm: React.FC = () => {
    const { family, expenses, addExpense, removeExpense, updateExpense, settings } = useAppStore();
    const [activeTab, setActiveTab] = useState<TabType>('living');

    const livingExpenses = expenses.filter(e => e.category === 'living') as LivingExpense[];
    const utilityExpenses = expenses.filter(e => e.category === 'utility') as UtilityExpense[];
    const communicationExpenses = expenses.filter(e => e.category === 'communication') as CommunicationExpense[];
    const medicalExpenses = expenses.filter(e => e.category === 'medical') as MedicalExpense[];
    const allowanceExpenses = expenses.filter(e => e.category === 'allowance') as AllowanceExpense[];

    // 生活費 (万円単位)
    const [livingName, setLivingName] = useState('食費');
    const [livingSubcategory, setLivingSubcategory] = useState<'food' | 'daily' | 'entertainment' | 'clothing' | 'other'>('food');
    const [livingMonthlyMan, setLivingMonthlyMan] = useState(6);
    const [livingStartYear, setLivingStartYear] = useState(settings.calculationStartYear);
    const [livingEndYear, setLivingEndYear] = useState(settings.calculationEndYear);

    // 光熱費 (万円単位)
    const [electricityMonthlyMan, setElectricityMonthlyMan] = useState(1.2);
    const [gasMonthlyMan, setGasMonthlyMan] = useState(0.8);
    const [waterMonthlyMan, setWaterMonthlyMan] = useState(0.5);
    const [utilityStartYear, setUtilityStartYear] = useState(settings.calculationStartYear);
    const [utilityEndYear, setUtilityEndYear] = useState(settings.calculationEndYear);

    // 通信費 (万円単位)
    const [internetMonthlyMan, setInternetMonthlyMan] = useState(0.5);
    const [mobileMonthlyMan, setMobileMonthlyMan] = useState(1.5);
    const [subscriptionsMonthlyMan, setSubscriptionsMonthlyMan] = useState(0.3);
    const [communicationStartYear, setCommunicationStartYear] = useState(settings.calculationStartYear);
    const [communicationEndYear, setCommunicationEndYear] = useState(settings.calculationEndYear);

    // 医療費 (万円単位)
    const [medicalMonthlyMan, setMedicalMonthlyMan] = useState(1);
    const [medicalStartYear, setMedicalStartYear] = useState(settings.calculationStartYear);
    const [medicalEndYear, setMedicalEndYear] = useState(settings.calculationEndYear);

    // お小遣い (万円単位)
    const [allowanceOwnerId, setAllowanceOwnerId] = useState(family.find(f => f.role === 'husband')?.id || '');
    const [allowanceMonthlyMan, setAllowanceMonthlyMan] = useState(3);
    const [allowanceStartYear, setAllowanceStartYear] = useState(settings.calculationStartYear);
    const [allowanceEndYear, setAllowanceEndYear] = useState(settings.calculationEndYear);

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
        updateExpense(editingId, editData);
        setEditingId(null);
        setEditData({});
    };

    const handleAddLiving = () => {
        const living: LivingExpense = {
            id: crypto.randomUUID(),
            category: 'living',
            name: livingName,
            subcategory: livingSubcategory,
            monthlyAmount: toYen(livingMonthlyMan),
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
            electricityMonthly: toYen(electricityMonthlyMan),
            gasMonthly: toYen(gasMonthlyMan),
            waterMonthly: toYen(waterMonthlyMan),
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
            internetMonthly: toYen(internetMonthlyMan),
            mobileMonthly: toYen(mobileMonthlyMan),
            subscriptionsMonthly: toYen(subscriptionsMonthlyMan),
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
            monthlyAmount: toYen(medicalMonthlyMan),
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
            monthlyAmount: toYen(allowanceMonthlyMan),
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
                                {editingId === item.id ? (
                                    <div className={styles.editFormFull}>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>名称</label>
                                                <input type="text" value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>カテゴリ</label>
                                                <select value={editData.subcategory || 'food'} onChange={(e) => setEditData({...editData, subcategory: e.target.value})}>
                                                    <option value="food">食費</option>
                                                    <option value="daily">日用品</option>
                                                    <option value="entertainment">娯楽費</option>
                                                    <option value="clothing">被服費</option>
                                                    <option value="other">その他</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>月額 (万円)</label>
                                            <input type="number" step="0.1" value={toMan(editData.monthlyAmount || 0)} onChange={(e) => setEditData({...editData, monthlyAmount: toYen(Number(e.target.value))})} />
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>開始年</label>
                                                <input type="number" value={editData.startYear || settings.calculationStartYear} onChange={(e) => setEditData({...editData, startYear: Number(e.target.value)})} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>終了年</label>
                                                <input type="number" value={editData.endYear || settings.calculationEndYear} onChange={(e) => setEditData({...editData, endYear: Number(e.target.value)})} />
                                            </div>
                                        </div>
                                        <div className={styles.editActions}>
                                            <button className={styles.saveBtn} onClick={saveEdit}><Check size={16} /> 保存</button>
                                            <button className={styles.cancelBtn} onClick={cancelEdit}><X size={16} /> キャンセル</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemName}>{item.name}</span>
                                            <span className={styles.itemDetail}>{toMan(item.monthlyAmount).toLocaleString()}万円/月</span>
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
                            <label>月額 (万円)</label>
                            <input type="number" step="0.1" value={livingMonthlyMan} onChange={(e) => setLivingMonthlyMan(Number(e.target.value))} />
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
                                {editingId === item.id ? (
                                    <div className={styles.editFormFull}>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>電気代（月額・万円）</label>
                                                <input type="number" step="0.1" value={toMan(editData.electricityMonthly || 0)} onChange={(e) => setEditData({...editData, electricityMonthly: toYen(Number(e.target.value))})} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>ガス代（月額・万円）</label>
                                                <input type="number" step="0.1" value={toMan(editData.gasMonthly || 0)} onChange={(e) => setEditData({...editData, gasMonthly: toYen(Number(e.target.value))})} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>水道代（月額・万円）</label>
                                                <input type="number" step="0.1" value={toMan(editData.waterMonthly || 0)} onChange={(e) => setEditData({...editData, waterMonthly: toYen(Number(e.target.value))})} />
                                            </div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>開始年</label>
                                                <input type="number" value={editData.startYear || settings.calculationStartYear} onChange={(e) => setEditData({...editData, startYear: Number(e.target.value)})} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>終了年</label>
                                                <input type="number" value={editData.endYear || settings.calculationEndYear} onChange={(e) => setEditData({...editData, endYear: Number(e.target.value)})} />
                                            </div>
                                        </div>
                                        <div className={styles.previewBox}>
                                            <span>合計: <strong>{toMan((editData.electricityMonthly || 0) + (editData.gasMonthly || 0) + (editData.waterMonthly || 0)).toFixed(1)}万円/月</strong></span>
                                        </div>
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
                                                電気{toMan(item.electricityMonthly || 0).toFixed(1)} + ガス{toMan(item.gasMonthly || 0).toFixed(1)} + 水道{toMan(item.waterMonthly || 0).toFixed(1)}万円/月
                                                {item.startYear && item.endYear && ` (${item.startYear}〜${item.endYear}年)`}
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
                        {utilityExpenses.length === 0 && <div className={styles.emptyState}>光熱費はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>光熱費を追加</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>電気代（月額・万円）</label>
                                <input type="number" step="0.1" value={electricityMonthlyMan} onChange={(e) => setElectricityMonthlyMan(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>ガス代（月額・万円）</label>
                                <input type="number" step="0.1" value={gasMonthlyMan} onChange={(e) => setGasMonthlyMan(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>水道代（月額・万円）</label>
                                <input type="number" step="0.1" value={waterMonthlyMan} onChange={(e) => setWaterMonthlyMan(Number(e.target.value))} />
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
                            <span>合計: <strong>{(electricityMonthlyMan + gasMonthlyMan + waterMonthlyMan).toFixed(1)}万円/月</strong></span>
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
                                {editingId === item.id ? (
                                    <div className={styles.editFormFull}>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>インターネット（月額・万円）</label>
                                                <input type="number" step="0.1" value={toMan(editData.internetMonthly || 0)} onChange={(e) => setEditData({...editData, internetMonthly: toYen(Number(e.target.value))})} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>携帯電話（世帯合計・万円）</label>
                                                <input type="number" step="0.1" value={toMan(editData.mobileMonthly || 0)} onChange={(e) => setEditData({...editData, mobileMonthly: toYen(Number(e.target.value))})} />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>サブスク等（月額・万円）</label>
                                            <input type="number" step="0.1" value={toMan(editData.subscriptionsMonthly || 0)} onChange={(e) => setEditData({...editData, subscriptionsMonthly: toYen(Number(e.target.value))})} />
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>開始年</label>
                                                <input type="number" value={editData.startYear || settings.calculationStartYear} onChange={(e) => setEditData({...editData, startYear: Number(e.target.value)})} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>終了年</label>
                                                <input type="number" value={editData.endYear || settings.calculationEndYear} onChange={(e) => setEditData({...editData, endYear: Number(e.target.value)})} />
                                            </div>
                                        </div>
                                        <div className={styles.previewBox}>
                                            <span>合計: <strong>{toMan((editData.internetMonthly || 0) + (editData.mobileMonthly || 0) + (editData.subscriptionsMonthly || 0)).toFixed(1)}万円/月</strong></span>
                                        </div>
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
                                                {toMan((item.internetMonthly || 0) + (item.mobileMonthly || 0) + (item.subscriptionsMonthly || 0)).toFixed(1)}万円/月
                                                {item.startYear && item.endYear && ` (${item.startYear}〜${item.endYear}年)`}
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
                        {communicationExpenses.length === 0 && <div className={styles.emptyState}>通信費はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>通信費を追加</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>インターネット（月額・万円）</label>
                                <input type="number" step="0.1" value={internetMonthlyMan} onChange={(e) => setInternetMonthlyMan(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>携帯電話（世帯合計・万円）</label>
                                <input type="number" step="0.1" value={mobileMonthlyMan} onChange={(e) => setMobileMonthlyMan(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>サブスク等（月額・万円）</label>
                            <input type="number" step="0.1" value={subscriptionsMonthlyMan} onChange={(e) => setSubscriptionsMonthlyMan(Number(e.target.value))} />
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
                            <span>合計: <strong>{(internetMonthlyMan + mobileMonthlyMan + subscriptionsMonthlyMan).toFixed(1)}万円/月</strong></span>
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
                                {editingId === item.id ? (
                                    <div className={styles.editFormFull}>
                                        <div className={styles.formGroup}>
                                            <label>月額医療費 (万円)</label>
                                            <input type="number" step="0.1" value={toMan(editData.monthlyAmount || 0)} onChange={(e) => setEditData({...editData, monthlyAmount: toYen(Number(e.target.value))})} />
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>開始年</label>
                                                <input type="number" value={editData.startYear || settings.calculationStartYear} onChange={(e) => setEditData({...editData, startYear: Number(e.target.value)})} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>終了年</label>
                                                <input type="number" value={editData.endYear || settings.calculationEndYear} onChange={(e) => setEditData({...editData, endYear: Number(e.target.value)})} />
                                            </div>
                                        </div>
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
                                                {toMan(item.monthlyAmount).toFixed(1)}万円/月
                                                {item.startYear && item.endYear && ` (${item.startYear}〜${item.endYear}年)`}
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
                        {medicalExpenses.length === 0 && <div className={styles.emptyState}>医療費はまだ登録されていません。</div>}
                    </div>
                    <div className={styles.addForm}>
                        <h3 className={styles.formTitle}>医療費を追加</h3>
                        <div className={styles.formGroup}>
                            <label>月額医療費 (万円)</label>
                            <input type="number" step="0.1" value={medicalMonthlyMan} onChange={(e) => setMedicalMonthlyMan(Number(e.target.value))} />
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
                                    {editingId === item.id ? (
                                        <div className={styles.editFormFull}>
                                            <div className={styles.row}>
                                                <div className={styles.formGroup}>
                                                    <label>対象者</label>
                                                    <select value={editData.ownerId || ''} onChange={(e) => setEditData({...editData, ownerId: e.target.value, name: `${family.find(f => f.id === e.target.value)?.name || ''}のお小遣い`})}>
                                                        {family.map(f => (
                                                            <option key={f.id} value={f.id}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>月額 (万円)</label>
                                                    <input type="number" step="0.1" value={toMan(editData.monthlyAmount || 0)} onChange={(e) => setEditData({...editData, monthlyAmount: toYen(Number(e.target.value))})} />
                                                </div>
                                            </div>
                                            <div className={styles.row}>
                                                <div className={styles.formGroup}>
                                                    <label>開始年</label>
                                                    <input type="number" value={editData.startYear || settings.calculationStartYear} onChange={(e) => setEditData({...editData, startYear: Number(e.target.value)})} />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>終了年</label>
                                                    <input type="number" value={editData.endYear || settings.calculationEndYear} onChange={(e) => setEditData({...editData, endYear: Number(e.target.value)})} />
                                                </div>
                                            </div>
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
                                                    {owner?.name} | {toMan(item.monthlyAmount).toFixed(1)}万円/月
                                                    {item.startYear && item.endYear && ` (${item.startYear}〜${item.endYear}年)`}
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
                                    {family.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>月額 (万円)</label>
                                <input type="number" step="0.1" value={allowanceMonthlyMan} onChange={(e) => setAllowanceMonthlyMan(Number(e.target.value))} />
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
