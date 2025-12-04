import { GridStack } from "gridstack";
import { useEffect, useRef, useState } from "react";

export function useGridStack() {
    const gridRef = useRef<GridStack | null>(null)
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        
            const saveLayout = () => {
                if (gridRef.current) {
                    const serializedData = gridRef.current.save(false);
                    localStorage.setItem('grid-layout', JSON.stringify(serializedData));
                }
            };
    
          
            const timer = setTimeout(() => {
                const grid = GridStack.init({
                    marginUnit: 'px',
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
    
                const savedLayout = localStorage.getItem('grid-layout');
                if (savedLayout) {
                    try {
                        const parsedLayout = JSON.parse(savedLayout);
                        console.log("Layout salvo encontrado:", parsedLayout);
                        grid.load(parsedLayout);
                    } catch (e) {
                        console.error('Erro ao carregar layout salvo:', e);
                    }
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
    
        }, []);

        return { gridRef, isReady };

}