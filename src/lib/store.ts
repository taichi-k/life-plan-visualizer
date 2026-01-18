import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    FamilyMember,
    Income,
    Expense,
    Asset,
    LifeEvent,
    SimulationSettings
} from './types';

interface AppState {
    family: FamilyMember[];
    incomes: Income[];
    expenses: Expense[];
    assets: Asset[];
    events: LifeEvent[];
    settings: SimulationSettings;

    // Actions
    addFamilyMember: (member: FamilyMember) => void;
    updateFamilyMember: (id: string, member: Partial<FamilyMember>) => void;
    removeFamilyMember: (id: string) => void;

    addIncome: (income: Income) => void;
    updateIncome: (id: string, income: Partial<Income>) => void;
    removeIncome: (id: string) => void;

    addExpense: (expense: Expense) => void;
    updateExpense: (id: string, expense: Partial<Expense>) => void;
    removeExpense: (id: string) => void;

    addAsset: (asset: Asset) => void;
    updateAsset: (id: string, asset: Partial<Asset>) => void;
    removeAsset: (id: string) => void;

    addEvent: (event: LifeEvent) => void;
    updateEvent: (id: string, event: Partial<LifeEvent>) => void;
    removeEvent: (id: string) => void;

    updateSettings: (settings: Partial<SimulationSettings>) => void;
    setSettings: (settings: SimulationSettings) => void;
    resetAll: () => void;

    // Export/Import
    exportData: () => string;
    importData: (jsonString: string) => boolean;
}

const DEFAULT_SETTINGS: SimulationSettings = {
    currentYear: new Date().getFullYear(),
    calculationStartYear: new Date().getFullYear(),
    calculationEndYear: new Date().getFullYear() + 50,
    inflationRate: 1.0,
    incomeGrowthRate: 0.5,
};

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            family: [],
            incomes: [],
            expenses: [],
            assets: [],
            events: [],
            settings: DEFAULT_SETTINGS,

            addFamilyMember: (member) => set((state) => ({ family: [...state.family, member] })),
            updateFamilyMember: (id, member) => set((state) => ({
                family: state.family.map((f) => f.id === id ? { ...f, ...member } : f)
            })),
            removeFamilyMember: (id) => set((state) => ({
                family: state.family.filter((f) => f.id !== id)
            })),

            addIncome: (income) => set((state) => ({ incomes: [...state.incomes, income] })),
            updateIncome: (id, income) => set((state) => ({
                incomes: state.incomes.map((i) => i.id === id ? { ...i, ...income } as Income : i)
            })),
            removeIncome: (id) => set((state) => ({
                incomes: state.incomes.filter((i) => i.id !== id)
            })),

            addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
            updateExpense: (id, expense) => set((state) => ({
                expenses: state.expenses.map((e) => e.id === id ? { ...e, ...expense } as Expense : e)
            })),
            removeExpense: (id) => set((state) => ({
                expenses: state.expenses.filter((e) => e.id !== id)
            })),

            addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
            updateAsset: (id, asset) => set((state) => ({
                assets: state.assets.map((a) => a.id === id ? { ...a, ...asset } : a)
            })),
            removeAsset: (id) => set((state) => ({
                assets: state.assets.filter((a) => a.id !== id)
            })),

            addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
            updateEvent: (id, updatedEvent) => set((state) => ({
                events: state.events.map((e) => (e.id === id ? { ...e, ...updatedEvent } : e))
            })),
            removeEvent: (id) => set((state) => ({
                events: state.events.filter((e) => e.id !== id)
            })),

            updateSettings: (settings) => set((state) => ({
                settings: { ...state.settings, ...settings }
            })),
            setSettings: (settings) => set({ settings }),

            resetAll: () => set({
                family: [],
                incomes: [],
                expenses: [],
                assets: [],
                events: [],
                settings: DEFAULT_SETTINGS
            }),

            // Export data as JSON
            exportData: () => {
                const state = get();
                return JSON.stringify({
                    family: state.family,
                    incomes: state.incomes,
                    expenses: state.expenses,
                    assets: state.assets,
                    events: state.events,
                    settings: state.settings,
                    exportedAt: new Date().toISOString(),
                }, null, 2);
            },

            // Import data from JSON
            importData: (jsonString: string) => {
                try {
                    const data = JSON.parse(jsonString);
                    set({
                        family: data.family || [],
                        incomes: data.incomes || [],
                        expenses: data.expenses || [],
                        assets: data.assets || [],
                        events: data.events || [],
                        settings: data.settings || DEFAULT_SETTINGS,
                    });
                    return true;
                } catch (e) {
                    console.error('Failed to import data:', e);
                    return false;
                }
            },
        }),
        {
            name: 'life-plan-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
