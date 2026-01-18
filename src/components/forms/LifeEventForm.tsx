import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { LifeEvent, LifeEventType } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Edit2, Check, X, Car } from 'lucide-react';

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

    // 新規追加用
    const [name, setName] = useState('');
    const [eventType, setEventType] = useState<LifeEventType>('other');
    const [year, setYear] = useState(new Date().getFullYear() + 1);
    const [cost, setCost] = useState(1000000);
    const [isRecurring, setIsRecurring] = useState(false);
    const [interval, setInterval] = useState(10);

    // 車購入時の維持費設定
    const [carTaxYearly, setCarTaxYearly] = useState(40000);
    const [carInsuranceYearly, setCarInsuranceYearly] = useState(80000);
    const [carMaintenanceYearly, setCarMaintenanceYearly] = useState(100000);
    const [carGasMonthly, setCarGasMonthly] = useState(15000);
    const [carParkingMonthly, setCarParkingMonthly] = useState(15000);

    // 編集用
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editEventType, setEditEventType] = useState<LifeEventType>('other');
    const [editYear, setEditYear] = useState(0);
    const [editCost, setEditCost] = useState(0);
    const [editIsRecurring, setEditIsRecurring] = useState(false);
    const [editInterval, setEditInterval] = useState(10);
    const [editCarTaxYearly, setEditCarTaxYearly] = useState(0);
    const [editCarInsuranceYearly, setEditCarInsuranceYearly] = useState(0);
    const [editCarMaintenanceYearly, setEditCarMaintenanceYearly] = useState(0);
    const [editCarGasMonthly, setEditCarGasMonthly] = useState(0);
    const [editCarParkingMonthly, setEditCarParkingMonthly] = useState(0);

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
            cost,
            isRecurring,
            recurrenceInterval: isRecurring ? interval : undefined,
            carMaintenance: eventType === 'car-purchase' ? {
                taxYearly: carTaxYearly,
                insuranceYearly: carInsuranceYearly,
                maintenanceYearly: carMaintenanceYearly,
                gasMonthly: carGasMonthly,
                parkingMonthly: carParkingMonthly,
            } : undefined,
        };
        addEvent(event);
        setName('');
        setCost(1000000);
    };

    const handleStartEdit = (item: LifeEvent) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditEventType(item.eventType);
        setEditYear(item.year);
        setEditCost(item.cost);
        setEditIsRecurring(item.isRecurring);
        setEditInterval(item.recurrenceInterval || 10);
        setEditCarTaxYearly(item.carMaintenance?.taxYearly || 40000);
        setEditCarInsuranceYearly(item.carMaintenance?.insuranceYearly || 80000);
        setEditCarMaintenanceYearly(item.carMaintenance?.maintenanceYearly || 100000);
        setEditCarGasMonthly(item.carMaintenance?.gasMonthly || 15000);
        setEditCarParkingMonthly(item.carMaintenance?.parkingMonthly || 15000);
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const updated: LifeEvent = {
            id: editingId,
            name: editName,
            eventType: editEventType,
            year: editYear,
            cost: editCost,
            isRecurring: editIsRecurring,
            recurrenceInterval: editIsRecurring ? editInterval : undefined,
            carMaintenance: editEventType === 'car-purchase' ? {
                taxYearly: editCarTaxYearly,
                insuranceYearly: editCarInsuranceYearly,
                maintenanceYearly: editCarMaintenanceYearly,
                gasMonthly: editCarGasMonthly,
                parkingMonthly: editCarParkingMonthly,
            } : undefined,
        };
        updateEvent(editingId, updated);
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const getEventTypeLabel = (type: LifeEventType) => {
        return EVENT_TYPE_OPTIONS.find(o => o.value === type)?.label || type;
    };

    const carYearlyCost = calcCarYearlyCost(carTaxYearly, carInsuranceYearly, carMaintenanceYearly, carGasMonthly, carParkingMonthly);
    const editCarYearlyCost = calcCarYearlyCost(editCarTaxYearly, editCarInsuranceYearly, editCarMaintenanceYearly, editCarGasMonthly, editCarParkingMonthly);

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
                                        <label>費用</label>
                                        <input type="number" value={editCost} onChange={(e) => setEditCost(Number(e.target.value))} />
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
                                {editEventType === 'car-purchase' && (
                                    <>
                                        <div className={styles.sectionTitle}><Car size={16} /> 自動車維持費</div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>自動車税（年額）</label>
                                                <input type="number" value={editCarTaxYearly} onChange={(e) => setEditCarTaxYearly(Number(e.target.value))} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>自動車保険（年額）</label>
                                                <input type="number" value={editCarInsuranceYearly} onChange={(e) => setEditCarInsuranceYearly(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>車検・整備費（年平均）</label>
                                                <input type="number" value={editCarMaintenanceYearly} onChange={(e) => setEditCarMaintenanceYearly(Number(e.target.value))} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>ガソリン代（月額）</label>
                                                <input type="number" value={editCarGasMonthly} onChange={(e) => setEditCarGasMonthly(Number(e.target.value))} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>駐車場代（月額）</label>
                                                <input type="number" value={editCarParkingMonthly} onChange={(e) => setEditCarParkingMonthly(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className={styles.previewBox}>
                                            <div className={styles.previewContent}>
                                                <span className={styles.previewLabel}>年間維持費</span>
                                                <span className={styles.previewValue}>{editCarYearlyCost.toLocaleString()}円</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className={styles.itemActions}>
                                    <button className={styles.saveBtn} onClick={handleSaveEdit}><Check size={16} /> 保存</button>
                                    <button className={styles.cancelBtn} onClick={handleCancelEdit}><X size={16} /> キャンセル</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {getEventTypeLabel(item.eventType)} | {item.year}年 | {item.cost.toLocaleString()}円 | {item.isRecurring ? `${item.recurrenceInterval}年ごと` : '一回限り'}
                                        {item.eventType === 'car-purchase' && item.carMaintenance && (
                                            <> | 維持費 {calcCarYearlyCost(item.carMaintenance.taxYearly, item.carMaintenance.insuranceYearly, item.carMaintenance.maintenanceYearly, item.carMaintenance.gasMonthly, item.carMaintenance.parkingMonthly).toLocaleString()}円/年</>
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
                        <label>費用{eventType === 'car-purchase' ? '（購入価格）' : ''}</label>
                        <input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
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

                {eventType === 'car-purchase' && (
                    <>
                        <div className={styles.sectionTitle}><Car size={16} /> 自動車維持費</div>
                        <div className={styles.helpText}>
                            <span>車を所有している期間、毎年かかる維持費を設定します。</span>
                        </div>
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
                            <div className={styles.previewContent}>
                                <span className={styles.previewLabel}>年間維持費</span>
                                <span className={styles.previewValue}>{carYearlyCost.toLocaleString()}円</span>
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
