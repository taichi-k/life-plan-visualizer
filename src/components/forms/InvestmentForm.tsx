import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Asset, AssetType } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Edit2, Check, X, TrendingUp, PiggyBank } from 'lucide-react';

export const InvestmentForm: React.FC = () => {
    const { assets, addAsset, removeAsset, updateAsset, settings } = useAppStore();

    // 新規追加用
    const [name, setName] = useState('積立NISA');
    const [currentValue, setCurrentValue] = useState(0);
    const [annualInterestRate, setAnnualInterestRate] = useState(3);
    const [isAccumulating, setIsAccumulating] = useState(true);
    const [monthlyContribution, setMonthlyContribution] = useState(33333);
    const [accumulationStartYear, setAccumulationStartYear] = useState(settings.currentYear);
    const [accumulationEndYear, setAccumulationEndYear] = useState(settings.currentYear + 20);

    // 編集用
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editCurrentValue, setEditCurrentValue] = useState(0);
    const [editAnnualInterestRate, setEditAnnualInterestRate] = useState(3);
    const [editIsAccumulating, setEditIsAccumulating] = useState(true);
    const [editMonthlyContribution, setEditMonthlyContribution] = useState(0);
    const [editAccumulationStartYear, setEditAccumulationStartYear] = useState(settings.currentYear);
    const [editAccumulationEndYear, setEditAccumulationEndYear] = useState(settings.currentYear + 20);

    const handleAdd = () => {
        if (!name) return;
        const asset: Asset = {
            id: crypto.randomUUID(),
            name,
            type: 'mutual-fund',
            currentValue,
            annualInterestRate,
            isCompounding: true,
            isAccumulating,
            monthlyContribution: isAccumulating ? monthlyContribution : 0,
            accumulationStartYear: isAccumulating ? accumulationStartYear : undefined,
            accumulationEndYear: isAccumulating ? accumulationEndYear : undefined,
        };
        addAsset(asset);
        setName('積立投資');
    };

    const startEdit = (asset: Asset) => {
        setEditingId(asset.id);
        setEditName(asset.name);
        setEditCurrentValue(asset.currentValue);
        setEditAnnualInterestRate(asset.annualInterestRate);
        setEditIsAccumulating(asset.isAccumulating || false);
        setEditMonthlyContribution(asset.monthlyContribution || 0);
        setEditAccumulationStartYear(asset.accumulationStartYear || settings.currentYear);
        setEditAccumulationEndYear(asset.accumulationEndYear || settings.currentYear + 20);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = () => {
        if (!editingId || !editName) return;
        updateAsset(editingId, {
            name: editName,
            currentValue: editCurrentValue,
            annualInterestRate: editAnnualInterestRate,
            isAccumulating: editIsAccumulating,
            monthlyContribution: editIsAccumulating ? editMonthlyContribution : 0,
            accumulationStartYear: editIsAccumulating ? editAccumulationStartYear : undefined,
            accumulationEndYear: editIsAccumulating ? editAccumulationEndYear : undefined,
        });
        setEditingId(null);
    };

    // 将来の資産予測を計算
    const calculateFutureValue = (initial: number, rate: number, monthly: number, years: number): number => {
        let total = initial;
        for (let i = 0; i < years; i++) {
            total += monthly * 12;
            total *= (1 + rate / 100);
        }
        return Math.round(total);
    };

    const previewYears = accumulationEndYear - accumulationStartYear;
    const previewFutureValue = calculateFutureValue(currentValue, annualInterestRate, isAccumulating ? monthlyContribution : 0, previewYears);
    const previewTotalContribution = currentValue + (isAccumulating ? monthlyContribution * 12 * previewYears : 0);

    // 積立投資用の資産（mutual-fund, stock）をフィルター
    const investmentAssets = assets.filter(a => a.type !== 'cash' && a.type !== 'deposit');

    return (
        <div className={styles.container}>
            <div className={styles.helpText}>
                <TrendingUp size={16} />
                <span>積立投資や資産運用の設定をします。毎月の積立額と想定利回りから将来の資産を予測できます。</span>
            </div>

            <div className={styles.list}>
                {investmentAssets.map((asset) => (
                    <div key={asset.id} className={styles.listItem}>
                        {editingId === asset.id ? (
                            <div className={styles.editFormFull}>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>名称</label>
                                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>現在の資産額（円）</label>
                                        <input type="number" value={editCurrentValue} onChange={(e) => setEditCurrentValue(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>想定利回り（%）</label>
                                        <input type="number" value={editAnnualInterestRate} onChange={(e) => setEditAnnualInterestRate(Number(e.target.value))} step="0.1" />
                                    </div>
                                </div>
                                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <input type="checkbox" checked={editIsAccumulating} onChange={(e) => setEditIsAccumulating(e.target.checked)} style={{ width: 'auto', marginRight: '8px' }} />
                                    <label style={{ marginBottom: 0 }}>毎月積立を行う</label>
                                </div>
                                {editIsAccumulating && (
                                    <>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>毎月積立額（円）</label>
                                                <input type="number" value={editMonthlyContribution} onChange={(e) => setEditMonthlyContribution(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>積立開始年</label>
                                                <input type="number" value={editAccumulationStartYear} onChange={(e) => setEditAccumulationStartYear(Number(e.target.value))} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>積立終了年</label>
                                                <input type="number" value={editAccumulationEndYear} onChange={(e) => setEditAccumulationEndYear(Number(e.target.value))} />
                                            </div>
                                        </div>
                                    </>
                                )}
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
                                    <span className={styles.itemName}>{asset.name}</span>
                                    <span className={styles.itemDetail}>
                                        現在: {asset.currentValue.toLocaleString()}円 | 利回り: {asset.annualInterestRate}%
                                        {asset.isAccumulating && ` | 積立: ${(asset.monthlyContribution || 0).toLocaleString()}円/月`}
                                    </span>
                                </div>
                                <div className={styles.itemActions}>
                                    <button className={styles.editBtn} onClick={() => startEdit(asset)} title="編集">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => removeAsset(asset.id)} title="削除">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {investmentAssets.length === 0 && <div className={styles.emptyState}>積立投資はまだ登録されていません。</div>}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>積立投資を追加</h3>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>名称</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 積立NISA" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>現在の資産額（円）</label>
                        <input type="number" value={currentValue} onChange={(e) => setCurrentValue(Number(e.target.value))} />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>想定利回り（%/年）</label>
                        <input type="number" value={annualInterestRate} onChange={(e) => setAnnualInterestRate(Number(e.target.value))} step="0.1" />
                    </div>
                </div>

                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <input type="checkbox" checked={isAccumulating} onChange={(e) => setIsAccumulating(e.target.checked)} style={{ width: 'auto', marginRight: '8px' }} />
                    <label style={{ marginBottom: 0 }}>毎月積立を行う</label>
                </div>

                {isAccumulating && (
                    <>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>毎月積立額（円）</label>
                                <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>積立開始年</label>
                                <input type="number" value={accumulationStartYear} onChange={(e) => setAccumulationStartYear(Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>積立終了年</label>
                                <input type="number" value={accumulationEndYear} onChange={(e) => setAccumulationEndYear(Number(e.target.value))} />
                            </div>
                        </div>
                    </>
                )}

                {/* プレビュー */}
                <div className={styles.previewBox}>
                    <PiggyBank size={18} />
                    <div className={styles.previewContent}>
                        <div className={styles.previewLabel}>{previewYears}年後の予想資産額</div>
                        <div className={styles.previewValue}>{previewFutureValue.toLocaleString()}円</div>
                        <div className={styles.previewDetail}>
                            (元本: {previewTotalContribution.toLocaleString()}円 → 運用益: {(previewFutureValue - previewTotalContribution).toLocaleString()}円)
                        </div>
                    </div>
                </div>

                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} />
                    積立投資を追加
                </button>
            </div>
        </div>
    );
};
