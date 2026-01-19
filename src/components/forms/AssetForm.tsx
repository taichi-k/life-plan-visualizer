
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Asset } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';

// 万円 <-> 円 変換ヘルパー
const toMan = (yen: number) => Math.round(yen / 10000);
const toYen = (man: number) => man * 10000;

interface AssetFormProps {
    filterType?: string;
}

export const AssetForm: React.FC<AssetFormProps> = ({ filterType }) => {
    const { assets, addAsset, removeAsset, updateAsset } = useAppStore();

    // 新規追加用
    const [name, setName] = useState('');
    const [type, setType] = useState<Asset['type']>((filterType as Asset['type']) || 'cash');
    const [currentValueMan, setCurrentValueMan] = useState(0);
    const [interestRate, setInterestRate] = useState(0.0);

    // 編集用
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<Asset['type']>('cash');
    const [editValueMan, setEditValueMan] = useState(0);
    const [editInterestRate, setEditInterestRate] = useState(0);

    const filteredAssets = filterType
        ? assets.filter(a => a.type === filterType)
        : assets;

    const handleAdd = () => {
        if (!name) return;
        const asset: Asset = {
            id: crypto.randomUUID(),
            name,
            type,
            currentValue: toYen(currentValueMan),
            annualInterestRate: interestRate,
            isCompounding: true
        };
        addAsset(asset);
        setName('');
    };

    const startEdit = (item: Asset) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditType(item.type);
        setEditValueMan(toMan(item.currentValue));
        setEditInterestRate(item.annualInterestRate);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = () => {
        if (!editingId || !editName) return;
        updateAsset(editingId, {
            name: editName,
            type: editType,
            currentValue: toYen(editValueMan),
            annualInterestRate: editInterestRate,
        });
        setEditingId(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {filteredAssets.map((item) => (
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
                                        <select value={editType} onChange={(e) => setEditType(e.target.value as Asset['type'])}>
                                            <option value="cash">現金・預金</option>
                                            <option value="stock">株式・投資信託</option>
                                            <option value="real-estate">不動産</option>
                                            <option value="crypto">暗号資産</option>
                                            <option value="other">その他</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>現在価値 (万円)</label>
                                        <input type="number" value={editValueMan} onChange={(e) => setEditValueMan(Number(e.target.value))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>想定年利 (%)</label>
                                        <input type="number" step="0.1" value={editInterestRate} onChange={(e) => setEditInterestRate(Number(e.target.value))} />
                                    </div>
                                </div>
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
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemDetail}>
                                        {item.type} | {toMan(item.currentValue).toLocaleString()}万円 | {item.annualInterestRate}%
                                    </span>
                                </div>
                                <div className={styles.itemActions}>
                                    <button className={styles.editBtn} onClick={() => startEdit(item)} title="編集">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => removeAsset(item.id)} title="削除">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {assets.length === 0 && <div className={styles.emptyState}>資産はまだ登録されていません。</div>}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>資産を追加</h3>
                <div className={styles.formGroup}>
                    <label>名称</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="例: 銀行預金"
                    />
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>種類</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)}>
                            <option value="cash">現金・預金</option>
                            <option value="stock">株式・投資信託</option>
                            <option value="real-estate">不動産</option>
                            <option value="crypto">暗号資産</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>現在価値 (万円)</label>
                        <input
                            type="number"
                            value={currentValueMan}
                            onChange={(e) => setCurrentValueMan(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>想定年利 (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                        />
                    </div>
                </div>
                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} />
                    資産を追加
                </button>
            </div>
        </div>
    );
};
