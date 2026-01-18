import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { EducationExpense, EDUCATION_COSTS } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, GraduationCap, Calculator, Edit2, X } from 'lucide-react';

export const EducationForm: React.FC = () => {
    const { family, expenses, addExpense, updateExpense, removeExpense, settings } = useAppStore();
    const educationExpenses = expenses.filter(e => e.category === 'education') as EducationExpense[];
    const children = family.filter(f => f.role === 'child');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [childId, setChildId] = useState(children[0]?.id || '');
    const [kindergartenType, setKindergartenType] = useState<'public' | 'private' | 'none'>('private');
    const [elementaryType, setElementaryType] = useState<'public' | 'private'>('public');
    const [juniorHighType, setJuniorHighType] = useState<'public' | 'private'>('public');
    const [highSchoolType, setHighSchoolType] = useState<'public' | 'private'>('public');
    const [universityType, setUniversityType] = useState<'national' | 'public' | 'private-arts' | 'private-science' | 'none'>('private-arts');
    const [extracurricularMonthly, setExtracurricularMonthly] = useState(20000);
    const [extracurricularStartAge, setExtracurricularStartAge] = useState(6);
    const [extracurricularEndAge, setExtracurricularEndAge] = useState(18);

    // 編集モードに入る
    const startEdit = (item: EducationExpense) => {
        setEditingId(item.id);
        setChildId(item.childId);
        setKindergartenType(item.kindergarten.type);
        setElementaryType(item.elementary.type);
        setJuniorHighType(item.juniorHigh.type);
        setHighSchoolType(item.highSchool.type);
        setUniversityType(item.university.type);
        setExtracurricularMonthly(item.extracurricularMonthly || 0);
        setExtracurricularStartAge(item.extracurricularStartAge || 6);
        setExtracurricularEndAge(item.extracurricularEndAge || 18);
    };

    // 編集をキャンセル
    const cancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    // フォームをリセット
    const resetForm = () => {
        setChildId(children[0]?.id || '');
        setKindergartenType('private');
        setElementaryType('public');
        setJuniorHighType('public');
        setHighSchoolType('public');
        setUniversityType('private-arts');
        setExtracurricularMonthly(20000);
        setExtracurricularStartAge(6);
        setExtracurricularEndAge(18);
    };

    // プリセット
    const applyPreset = (preset: 'all-public' | 'standard' | 'all-private') => {
        if (preset === 'all-public') {
            setKindergartenType('public');
            setElementaryType('public');
            setJuniorHighType('public');
            setHighSchoolType('public');
            setUniversityType('national');
        } else if (preset === 'standard') {
            setKindergartenType('private');
            setElementaryType('public');
            setJuniorHighType('public');
            setHighSchoolType('public');
            setUniversityType('private-arts');
        } else if (preset === 'all-private') {
            setKindergartenType('private');
            setElementaryType('private');
            setJuniorHighType('private');
            setHighSchoolType('private');
            setUniversityType('private-science');
        }
    };

    // 総額プレビュー
    const calculateTotalEducationCost = (): number => {
        let total = 0;
        if (kindergartenType !== 'none') {
            total += EDUCATION_COSTS.kindergarten[kindergartenType] * 3;
        }
        total += EDUCATION_COSTS.elementary[elementaryType] * 6;
        total += EDUCATION_COSTS.juniorHigh[juniorHighType] * 3;
        total += EDUCATION_COSTS.highSchool[highSchoolType] * 3;
        if (universityType !== 'none') {
            total += EDUCATION_COSTS.university[universityType] * 4;
        }
        // 習い事
        const extraYears = Math.max(0, extracurricularEndAge - extracurricularStartAge);
        total += extracurricularMonthly * 12 * extraYears;
        return total;
    };

    const handleAdd = () => {
        if (!childId) return;
        const child = children.find(c => c.id === childId);
        const education: EducationExpense = {
            id: crypto.randomUUID(),
            category: 'education',
            name: `${child?.name || '子供'}の教育費`,
            childId,
            kindergarten: { type: kindergartenType, startAge: 3 },
            elementary: { type: elementaryType },
            juniorHigh: { type: juniorHighType },
            highSchool: { type: highSchoolType },
            university: { type: universityType },
            extracurricularMonthly,
            extracurricularStartAge,
            extracurricularEndAge,
        };
        addExpense(education);
        resetForm();
    };

    const handleUpdate = () => {
        if (!editingId || !childId) return;
        const child = children.find(c => c.id === childId);
        updateExpense(editingId, {
            name: `${child?.name || '子供'}の教育費`,
            childId,
            kindergarten: { type: kindergartenType, startAge: 3 },
            elementary: { type: elementaryType },
            juniorHigh: { type: juniorHighType },
            highSchool: { type: highSchoolType },
            university: { type: universityType },
            extracurricularMonthly,
            extracurricularStartAge,
            extracurricularEndAge,
        });
        setEditingId(null);
        resetForm();
    };

    return (
        <div className={styles.container}>
            <div className={styles.helpText}>
                <GraduationCap size={16} />
                <span>教育費は文部科学省のデータを元に自動計算します。公立/私立を選択するだけでOKです。</span>
            </div>

            <div className={styles.list}>
                {educationExpenses.map((item) => {
                    const child = children.find(c => c.id === item.childId);
                    return (
                        <div key={item.id} className={`${styles.listItem} ${editingId === item.id ? styles.editing : ''}`}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemDetail}>
                                    {child?.name || '不明'} | 大学: {item.university.type}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className={styles.editBtn} onClick={() => startEdit(item)} title="編集">
                                    <Edit2 size={16} />
                                </button>
                                <button className={styles.deleteBtn} onClick={() => removeExpense(item.id)} title="削除">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {educationExpenses.length === 0 && <div className={styles.emptyState}>教育費はまだ登録されていません。</div>}
            </div>

            {children.length === 0 ? (
                <div className={styles.warningBox}>
                    ⚠️ 先に「家族情報」から子供を登録してください。
                </div>
            ) : (
                <div className={styles.addForm}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className={styles.formTitle}>{editingId ? '教育費を編集' : '教育費を追加'}</h3>
                        {editingId && (
                            <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>
                                <X size={16} />
                                キャンセル
                            </button>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>対象の子供</label>
                        <select value={childId} onChange={(e) => setChildId(e.target.value)}>
                            {children.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({settings.calculationStartYear - c.birthYear}歳)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>教育プラン</label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button type="button" className={styles.templateBtn} onClick={() => applyPreset('all-public')}>オール公立</button>
                                <button type="button" className={styles.templateBtn} onClick={() => applyPreset('standard')}>標準</button>
                                <button type="button" className={styles.templateBtn} onClick={() => applyPreset('all-private')}>オール私立</button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.educationGrid}>
                        <div className={styles.educationItem}>
                            <label>幼稚園 (3-5歳)</label>
                            <select value={kindergartenType} onChange={(e) => setKindergartenType(e.target.value as any)}>
                                <option value="none">なし（保育園等）</option>
                                <option value="public">公立 ({(EDUCATION_COSTS.kindergarten.public * 3).toLocaleString()}円/3年)</option>
                                <option value="private">私立 ({(EDUCATION_COSTS.kindergarten.private * 3).toLocaleString()}円/3年)</option>
                            </select>
                        </div>
                        <div className={styles.educationItem}>
                            <label>小学校 (6-11歳)</label>
                            <select value={elementaryType} onChange={(e) => setElementaryType(e.target.value as any)}>
                                <option value="public">公立 ({(EDUCATION_COSTS.elementary.public * 6).toLocaleString()}円/6年)</option>
                                <option value="private">私立 ({(EDUCATION_COSTS.elementary.private * 6).toLocaleString()}円/6年)</option>
                            </select>
                        </div>
                        <div className={styles.educationItem}>
                            <label>中学校 (12-14歳)</label>
                            <select value={juniorHighType} onChange={(e) => setJuniorHighType(e.target.value as any)}>
                                <option value="public">公立 ({(EDUCATION_COSTS.juniorHigh.public * 3).toLocaleString()}円/3年)</option>
                                <option value="private">私立 ({(EDUCATION_COSTS.juniorHigh.private * 3).toLocaleString()}円/3年)</option>
                            </select>
                        </div>
                        <div className={styles.educationItem}>
                            <label>高校 (15-17歳)</label>
                            <select value={highSchoolType} onChange={(e) => setHighSchoolType(e.target.value as any)}>
                                <option value="public">公立 ({(EDUCATION_COSTS.highSchool.public * 3).toLocaleString()}円/3年)</option>
                                <option value="private">私立 ({(EDUCATION_COSTS.highSchool.private * 3).toLocaleString()}円/3年)</option>
                            </select>
                        </div>
                        <div className={styles.educationItem}>
                            <label>大学 (18-21歳)</label>
                            <select value={universityType} onChange={(e) => setUniversityType(e.target.value as any)}>
                                <option value="none">進学しない</option>
                                <option value="national">国立 ({(EDUCATION_COSTS.university.national * 4).toLocaleString()}円/4年)</option>
                                <option value="public">公立 ({(EDUCATION_COSTS.university.public * 4).toLocaleString()}円/4年)</option>
                                <option value="private-arts">私立文系 ({(EDUCATION_COSTS.university['private-arts'] * 4).toLocaleString()}円/4年)</option>
                                <option value="private-science">私立理系 ({(EDUCATION_COSTS.university['private-science'] * 4).toLocaleString()}円/4年)</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.sectionTitle}>習い事・塾（任意）</div>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>月額費用</label>
                            <input
                                type="number"
                                value={extracurricularMonthly}
                                onChange={(e) => setExtracurricularMonthly(Number(e.target.value))}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>開始年齢</label>
                            <input
                                type="number"
                                value={extracurricularStartAge}
                                onChange={(e) => setExtracurricularStartAge(Number(e.target.value))}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>終了年齢</label>
                            <input
                                type="number"
                                value={extracurricularEndAge}
                                onChange={(e) => setExtracurricularEndAge(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className={styles.previewBox}>
                        <Calculator size={16} />
                        <span>推定総額: <strong>{calculateTotalEducationCost().toLocaleString()}円</strong></span>
                        <span>（約22年間）</span>
                    </div>

                    {editingId ? (
                        <button className={styles.addBtn} onClick={handleUpdate}>
                            <Edit2 size={18} />
                            教育費を更新
                        </button>
                    ) : (
                        <button className={styles.addBtn} onClick={handleAdd}>
                            <Plus size={18} />
                            教育費を追加
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
