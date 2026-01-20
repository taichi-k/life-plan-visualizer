'use client';

import React, { useMemo, useEffect, useState } from 'react';
import styles from './page.module.css';
import { useAppStore } from '../lib/store';
import { calculateLifePlan } from '../lib/engine';
import dynamic from 'next/dynamic';
import { DataTable } from '../components/dashboard/DataTable';

// recharts を使うコンポーネントを動的インポート（SSR無効化）
const BalanceChart = dynamic(
  () => import('../components/dashboard/BalanceChart').then(mod => ({ default: mod.BalanceChart })),
  { ssr: false, loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>グラフを読み込み中...</div> }
);

const AssetChart = dynamic(
  () => import('../components/dashboard/AssetChart').then(mod => ({ default: mod.AssetChart })),
  { ssr: false, loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>グラフを読み込み中...</div> }
);

export default function Home() {
  const { family, incomes, expenses, assets, events, settings } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const simulationData = useMemo(() => {
    return calculateLifePlan(family, incomes, expenses, assets, events, settings);
  }, [family, incomes, expenses, assets, events, settings]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title} suppressHydrationWarning>ライフプラン シミュレーション</h1>
        <p className={styles.subtitle} suppressHydrationWarning>
          {hydrated
            ? `現在の入力情報を元にした将来の資産推移シミュレーションです。(期間: ${settings.calculationStartYear}年 - ${settings.calculationEndYear}年)`
            : '読み込み中...'}
        </p>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>収支バランス (収入 vs 支出)</h3>
          <div className={styles.chartContainer}>
            {hydrated && <BalanceChart data={simulationData} />}
          </div>
        </div>
        <div className={styles.card}>
          <h3>資産残高の推移</h3>
          <div className={styles.chartContainer}>
            {hydrated && <AssetChart data={simulationData} />}
          </div>
        </div>
        <div className={styles.cardLarge}>
          <h3>シミュレーション詳細</h3>
          <div className={styles.tableContainer}>
            <DataTable data={simulationData} />
          </div>
        </div>
      </div>
    </div>
  );
}
