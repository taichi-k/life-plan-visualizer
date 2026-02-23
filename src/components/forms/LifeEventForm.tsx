import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { LifeEvent, LifeEventType } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Edit2, Check, X, Car } from 'lucide-react';

// 万円 <-> 円 変換ヘルパー
const toMan = (yen: number) => yen / 10000;
const toYen = (man: number) => man * 10000;

const EVENT_TYPE_OPTIONS: { value: LifeEventType; label: string }[] = [
    { value: 'travel-domestic', label: '国内旅行' },
    { value: 'travel-overseas', label: '海外旅行' },
    { value: 'car-purchase', label: '車購入' },
    { value: 'home-purchase', label: '住宅購入' },
    { value: 'wedding-support', label: '結婚援助' },
    { value: 'celebration', label: 'お祝い事' },
    { value: 'home-renovation', label: 'リフォーム' },
    { value: 'other', label: 'その他' },
];

export const LifeEventForm: React.FC = () => {
    const { events, addEvent, updateEvent, removeEvent } = useAppStore();
    
    // デバッグ用
    console.log('Current events:', events);

    // 新規追加用 (万円単位)
    const [name, setName] = useState('');
    const [eventType, setEventType] = useState<LifeEventType>('other');
    const [year, setYear] = useState(new Date().getFullYear() + 1);
    const [costMan, setCostMan] = useState(100);
    const [isRecurring, setIsRecurring] = useState(false);
    const [interval, setInterval] = useState(10);
    const [endYear, setEndYear] = useState<number | ''>('');

    // 車購入時の維持費設定 (万円単位)
    const [carTaxYearlyMan, setCarTaxYearlyMan] = useState(4);
    const [carInsuranceYearlyMan, setCarInsuranceYearlyMan] = useState(8);
    const [carMaintenanceYearlyMan, setCarMaintenanceYearlyMan] = useState(10);
    const [carGasMonthlyMan, setCarGasMonthlyMan] = useState(1.5);
    const [carParkingMonthlyMan, setCarParkingMonthlyMan] = useState(1.5);

    // 編集用 (万円単位)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editEventType, setEditEventType] = useState<LifeEventType>('other');
    const [editYear, setEditYear] = useState(0);
    const [editCostMan, setEditCostMan] = useState(0);
    const [editIsRecurring, setEditIsRecurring] = useState(false);
    const [editInterval, setEditInterval] = useState(10);
    const [editEndYear, setEditEndYear] = useState<number | ''>('');
    const [editCarTaxYearlyMan, setEditCarTaxYearlyMan] = useState(0);
    const [editCarInsuranceYearlyMan, setEditCarInsuranceYearlyMan] = useState(0);
    const [editCarMaintenanceYearlyMan, setEditCarMaintenanceYearlyMan] = useState(0);
    const [editCarGasMonthlyMan, setEditCarGasMonthlyMan] = useState(0);
    const [editCarParkingMonthlyMan, setEditCarParkingMonthlyMan] = useState(0);

    // 万円単位の年間維持費計算
    const calcCarYearlyCostMan = (tax: number, ins: number, maint: number, gas: number, parking: number) => {
        return tax + ins + maint + (gas + parking) * 12;
    };

    // 円単位の年間維持費計算（表示用）
    const calcCarYearlyCost = (tax: number, ins: number, maint: number, gas: number, parking: number) => {
        return tax + ins + maint + (gas + parking) * 12;
    };

    const handleAdd = () => {
        if (!name) return;
        const event: LifeEvent = {
            id: crypto.randomUUID(),
            name,
            eventType,
            year,
            cost: toYen(costMan),
            isRecurring,
            recurrenceInterval: isRecurring ? interval : undefined,
            endYear: endYear !== '' ? endYear : undefined,
            carMaintenance: eventType === 'car-purchase' ? {
                taxYearly: toYen(carTaxYearlyMan),
                insuranceYearly: toYen(carInsuranceYearlyMan),
                maintenanceYearly: toYen(carMaintenanceYearlyMan),
                gasMonthly: toYen(carGasMonthlyMan),
                parkingMonthly: toYen(carParkingMonthlyMan),
            } : undefined,
        };
        addEvent(event);
        setName('');
        setCostMan(100);
        setEndYear('');
    };

    const handleStartEdit = (item: LifeEvent) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditEventType(item.eventType);
        setEditYear(item.year);
        setEditCostMan(toMan(item.cost));
        setEditIsRecurring(item.isRecurring);
        setEditInterval(item.recurrenceInterval ?? 10);
        setEditEndYear(item.endYear ?? '');
        setEditCarTaxYearlyMan(toMan(item.carMaintenance?.taxYearly ?? 40000));
        setEditCarInsuranceYearlyMan(toMan(item.carMaintenance?.insuranceYearly ?? 80000));
        setEditCarMaintenanceYearlyMan(toMan(item.carMaintenance?.maintenanceYearly ?? 100000));
        setEditCarGasMonthlyMan(toMan(item.carMaintenance?.gasMonthly ?? 15000));
        setEditCarParkingMonthlyMan(toMan(item.carMaintenance?.parkingMonthly ?? 15000));
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const updated: LifeEvent = {
            id: editingId,
            name: editName,
            eventType: editEventType,
            year: editYear,
            cost: toYen(editCostMan),
            isRecurring: editIsRecurring,
            recurrenceInterval: editIsRecurring ? editInterval : undefined,
            endYear: editEndYear !== '' ? editEndYear : undefined,
            carMaintenance: editEventType === 'car-purchase' ? {
                taxYearly: toYen(editCarTaxYearlyMan),
                insuranceYearly: toYen(editCarInsuranceYearlyMan),
                maintenanceYearly: toYen(editCarMaintenanceYearlyMan),
                gasMonthly: toYen(editCarGasMonthlyMan),
                parkingMonthly: toYen(editCarParkingMonthlyMan),
            } : undefined,
        };
        console.log('Saving event:', editingId, updated);
        updateEvent(editingId, updated);
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const getEventTypeLabel = (type: LifeEventType) => {
        return EVENT_TYPE_OPTIONS.find(o => o.value === type)?.label || type;
    };

    const carYearlyCostMan = calcCarYearlyCostMan(carTaxYearlyMan, carInsuranceYearlyMan, carMaintenanceYearlyMan, carGasMonthlyMan, carParkingMonthlyMan);
    const editCarYearlyCostMan = calcCarYearlyCostMan(editCarTaxYearlyMan, editCarInsuranceYearlyMan, editCarMaintenanceYearlyMan, editCarGasMonthlyMan, editCarParkingMonthlyMan);

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {events.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                        {editingId === item.id ? (
                            <div className={styles.editFormFull}>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>名称</label>
                                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>種類</label>
                                        <select value={editEventType} onChange={(e) => setEditEventType(e.target.value as LifeEventType)}>
                                            {EVENT_TYPE_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>発生年</label>
                                        <input type="number" value={editYear} onChange={(e) => setEditYear(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>費用 (万円)</label>
                                        <input type="number" step="0.1" value={editCostMan} onChange={(e) => setEditCostMan(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <input type="checkbox" checked={editIsRecurring} onChange={(e) => setEditIsRecurring(e.target.checked)} style={{ width: 'auto', marginRight: '8px' }} />
                                        <label style={{ marginBottom: 0 }}>繰り返し?</label>
                                    </div>
                                    {editIsRecurring && (
                                        <div className={styles.formGroup}>
                                            <label>間隔 (年)</label>
                                            <input type="number" value={editInterval} onChange={(e) => setEditInterval(Number(e.target.value))} />
                                        </div>
                                    )}
                                </div>
                                {(editIsRecurring || editEventType === 'car-purchase') && (
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>終了年 {editEventType === 'car-purchase' ? '（維持費終了年）' : ''}</label>
                                            <input type="number" value={editEndYear} onChange={(e) => setEditEndYear(e.target.value === '' ? '' : Number(e.target.value))} placeholder="未設定（シミュレーション終了まで）" />
                                        </div>
                                    </div>
                                )}
                                {editEventType === 'car-purchase' && (
                                    <>
                                        <div className={styles.sectionTitle}><Car size={16} /> 自動車維持費</div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>自動車税（年額・万円）</label>
                                                <input type="number" step="0.1" value={editCarTaxYearlyMan} onChange={(e) => setEditCarTaxYearlyMan(Number(e.target.value))} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>自動車保険（年額・万円）</label>
                                                <input type="number" step="0.1" value={editCarInsuranceYearlyMan} onChange={(e) => setEditCarInsuranceYearlyMan(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>車検・整備費（年平均・万円）</label>
                                                <input type="number" step="0.1" value={editCarMaintenanceYearlyMan} onChange={(e) => setEditCarMaintenanceYearlyMan(Number(e.target.value))} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>ガソリン代（月額・万円）</label>
                                                <input type="number" step="0.1" value={editCarGasMonthlyMan} onChange={(e) => setEditCarGasMonthlyMan(Number(e.target.value))} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>駐車場代（月額・万円）</label>
                                                <input type="number" step="0.1" value={editCarParkingMonthlyMan} onChange={(e) => setEditCarParkingMonthlyMan(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className={styles.previewBox}>
                                            <div className={styles.previewContent}>
                                                <span className={styles.previewLabel}>年間維持費</span>
                                                <span className={styles.previewValue}>{editCarYearlyCostMan.toFixed(1)}万円</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className={styles.editActions}>
                                    <button className={styles.saveBtn} onClick={handleSaveEdit}><Check size={16} /> 保存</button>
                                    <button className={styles.cancelBtn} onClick={handleCancelEdit}><X size={16} /> キャンセル</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {getEventTypeLabel(item.eventType)} | {item.year}年{item.endYear ? `〜${item.endYear}年` : ''} | {toMan(item.cost).toFixed(1)}万円 | {item.isRecurring ? `${item.recurrenceInterval}年ごと` : '一回限り'}
                                        {item.eventType === 'car-purchase' && item.carMaintenance && (
                                            <> | 維持費 {toMan(calcCarYearlyCost(item.carMaintenance.taxYearly, item.carMaintenance.insuranceYearly, item.carMaintenance.maintenanceYearly, item.carMaintenance.gasMonthly, item.carMaintenance.parkingMonthly)).toFixed(1)}万円/年</>
                                        )}
                                    </span>
                                </div>
                                <div className={styles.itemActions}>
                                    <button className={styles.editBtn} onClick={() => handleStartEdit(item)}><Edit2 size={16} /></button>
                                    <button className={styles.deleteBtn} onClick={() => removeEvent(item.id)}><Trash2 size={16} /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {events.length === 0 && <div className={styles.emptyState}>ライフイベントはまだ登録されていません。</div>}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>ライフイベントを追加</h3>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>名称</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 車購入" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>種類</label>
                        <select value={eventType} onChange={(e) => setEventType(e.target.value as LifeEventType)}>
                            {EVENT_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>発生年</label>
                        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>費用{eventType === 'car-purchase' ? '（購入価格）' : ''} (万円)</label>
                        <input type="number" step="0.1" value={costMan} onChange={(e) => setCostMan(Number(e.target.value))} />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} style={{ width: 'auto', marginRight: '8px' }} />
                        <label style={{ marginBottom: 0 }}>繰り返し?{eventType === 'car-purchase' ? '（買い替え）' : ''}</label>
                    </div>
                    {isRecurring && (
                        <div className={styles.formGroup}>
                            <label>間隔 (年)</label>
                            <input type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} />
                        </div>
                    )}
                </div>
                {(isRecurring || eventType === 'car-purchase') && (
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>終了年 {eventType === 'car-purchase' ? '（維持費終了年）' : ''}</label>
                            <input type="number" value={endYear} onChange={(e) => setEndYear(e.target.value === '' ? '' : Number(e.target.value))} placeholder="未設定（シミュレーション終了まで）" />
                        </div>
                    </div>
                )}

                {eventType === 'car-purchase' && (
                    <>
                        <div className={styles.sectionTitle}><Car size={16} /> 自動車維持費</div>
                        <div className={styles.helpText}>
                            <span>車を所有している期間、毎年かかる維持費を設定します。</span>
                        </div>
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
                            <div className={styles.previewContent}>
                                <span className={styles.previewLabel}>年間維持費</span>
                                <span className={styles.previewValue}>{carYearlyCostMan.toFixed(1)}万円</span>
                                <span className={styles.previewDetail}>（買い替え費用除く）</span>
                            </div>
                        </div>
                    </>
                )}

                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} />
                    イベントを追加
                </button>
            </div>
        </div>
    );
};
