import { updateUserPreferences } from "@/api/userService";
import type { UserPreferences } from "@/types/types";
import { GridStack, type GridStackWidget } from "gridstack";
import { useEffect, useRef, useState } from "react";

export function useGridStack(preferences?: UserPreferences, isLoading: boolean = false) {
    const gridRef = useRef<GridStack | null>(null)
    const [isReady, setIsReady] = useState(false);


    useEffect(() => {

        if (isLoading) return

        const saveLayout = () => {
            if (gridRef.current) {
                const serializedData = gridRef.current.save(false) as GridStackWidget[];
                // be safe: only persist when we actually have an array of widgets
                if (!Array.isArray(serializedData)) return;
                if (preferences) {
                    updateUserPreferences(preferences.id, { dashboardLayout: serializedData });
                }
                localStorage.setItem('grid-layout', JSON.stringify(serializedData));
            }
        };


        const timer = setTimeout(() => {
            const grid = GridStack.init({
                marginUnit: 'px',
                margin: 8,
                handle: '.handle',
                cellHeight: '100px',
                columnOpts: {
                    breakpoints: [{ w: 768, c: 1 }],
                    columnMax: 6,
                    layout: 'compact'
                }
            });

            if (!grid) {
                console.error("Falha ao inicializar o GridStack. O elemento alvo pode não existir.");
                return;
            }

            gridRef.current = grid;

            let layoutToLoad: GridStackWidget[] | null = null;

            if (preferences && preferences.dashboardLayout) {
                layoutToLoad = preferences.dashboardLayout;
            } else {
                const savedLayout = localStorage.getItem('grid-layout');
                if (savedLayout) {
                    try {
                        layoutToLoad = JSON.parse(savedLayout);
                    } catch (e) {
                        console.error('Erro ao carregar layout salvo:', e);
                    }
                }
            }

            if (layoutToLoad) {
                grid.load(layoutToLoad, false);
            }


            grid.on('change', saveLayout);

            setTimeout(() => {
                setIsReady(true);
            }, 200);

        }, 0);


        return () => {
            clearTimeout(timer);
            const grid = gridRef.current;
            if (grid) {
                grid.off('change');
                grid.destroy();
                gridRef.current = null;
            }
        };

    }, [preferences, isLoading]);

    return { gridRef, isReady };

}