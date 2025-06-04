import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  CSVFile, 
  ChartOptions, 
  ChartData, 
  LineStyle, 
  PointStyle,
  AxisConfig
} from '../types/visualization';
import { parseCSV } from '../utils/csvParser';

interface VisualizationContextType {
  files: CSVFile[];
  chartData: ChartData | null;
  chartOptions: ChartOptions;
  addFile: (file: File) => Promise<void>;
  removeFile: (id: string) => void;
  updateAxisSelection: (fileId: string, xAxis: string, yAxes: string[]) => void;
  updateLineStyle: (fileId: string, column: string, style: LineStyle) => void;
  updatePointStyle: (fileId: string, column: string, style: PointStyle) => void;
  updateColor: (fileId: string, column: string, color: string) => void;
  updateAxisConfig: (axis: 'x' | 'y', config: Partial<AxisConfig>) => void;
  renameAxis: (fileId: string, originalName: string, newName: string) => void;
  generateChart: () => void;
  resetChart: () => void;
}

const DEFAULT_CHART_OPTIONS: ChartOptions = {
  title: 'CSV Visualization',
  showLegend: true,
  showGrid: true,
  axisConfig: {
    x: {
      title: 'X Axis',
      min: undefined,
      max: undefined,
      autoScale: true,
    },
    y: {
      title: 'Y Axis',
      min: undefined,
      max: undefined,
      autoScale: true,
    },
  },
};

const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

export const VisualizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<CSVFile[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartOptions, setChartOptions] = useState<ChartOptions>(DEFAULT_CHART_OPTIONS);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('csvFiles');
    const savedOptions = localStorage.getItem('chartOptions');
    
    if (savedFiles) {
      try {
        const filesMetadata = JSON.parse(savedFiles);
        setFiles(filesMetadata.map((file: any) => ({
          ...file,
          data: [], // Initialize with empty data array
        })));
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }
    
    if (savedOptions) {
      try {
        setChartOptions(JSON.parse(savedOptions));
      } catch (error) {
        console.error('Error loading saved options:', error);
      }
    }
  }, []);
  
  // Save metadata to localStorage when files change
  useEffect(() => {
    try {
      // Only save metadata, excluding the actual CSV data
      const filesMetadata = files.map(file => ({
        id: file.id,
        name: file.name,
        columns: file.columns,
        selected: file.selected,
        columnStyles: file.columnStyles,
      }));
      localStorage.setItem('csvFiles', JSON.stringify(filesMetadata));
    } catch (error) {
      console.error('Error saving files metadata:', error);
    }
  }, [files]);
  
  useEffect(() => {
    localStorage.setItem('chartOptions', JSON.stringify(chartOptions));
  }, [chartOptions]);
  
  const addFile = async (file: File) => {
    try {
      const parsedData = await parseCSV(file);
      const columns = Object.keys(parsedData.data[0] || {});
      
      const defaultXAxis = columns[0] || '';
      const defaultYAxes = columns.length > 1 ? [columns[1]] : [];
      
      const newFile: CSVFile = {
        id: uuidv4(),
        name: file.name,
        columns,
        data: parsedData.data,
        selected: {
          xAxis: defaultXAxis,
          yAxes: defaultYAxes,
        },
        columnStyles: {},
      };
      
      // Initialize column styles with default values
      columns.forEach(col => {
        newFile.columnStyles[col] = {
          color: getRandomColor(),
          lineStyle: 'solid',
          pointStyle: 'circle',
          showPoints: true,
          showLine: true,
        };
      });
      
      setFiles(prev => [...prev, newFile]);
    } catch (error) {
      console.error('Error adding file:', error);
      throw error;
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };
  
  const updateAxisSelection = (fileId: string, xAxis: string, yAxes: string[]) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, selected: { xAxis, yAxes } } 
          : file
      )
    );
  };
  
  const updateLineStyle = (fileId: string, column: string, style: LineStyle) => {
    setFiles(prev => 
      prev.map(file => {
        if (file.id === fileId && file.columnStyles[column]) {
          return {
            ...file,
            columnStyles: {
              ...file.columnStyles,
              [column]: {
                ...file.columnStyles[column],
                lineStyle: style,
              },
            },
          };
        }
        return file;
      })
    );
  };
  
  const updatePointStyle = (fileId: string, column: string, style: PointStyle) => {
    setFiles(prev => 
      prev.map(file => {
        if (file.id === fileId && file.columnStyles[column]) {
          return {
            ...file,
            columnStyles: {
              ...file.columnStyles,
              [column]: {
                ...file.columnStyles[column],
                pointStyle: style,
              },
            },
          };
        }
        return file;
      })
    );
  };
  
  const updateColor = (fileId: string, column: string, color: string) => {
    setFiles(prev => 
      prev.map(file => {
        if (file.id === fileId && file.columnStyles[column]) {
          return {
            ...file,
            columnStyles: {
              ...file.columnStyles,
              [column]: {
                ...file.columnStyles[column],
                color,
              },
            },
          };
        }
        return file;
      })
    );
  };
  
  const updateAxisConfig = (axis: 'x' | 'y', config: Partial<AxisConfig>) => {
    setChartOptions(prev => ({
      ...prev,
      axisConfig: {
        ...prev.axisConfig,
        [axis]: {
          ...prev.axisConfig[axis],
          ...config,
        },
      },
    }));
  };
  
  const renameAxis = (fileId: string, originalName: string, newName: string) => {
    setFiles(prev => 
      prev.map(file => {
        if (file.id === fileId) {
          // Update column name in the columns array
          const updatedColumns = file.columns.map(col => 
            col === originalName ? newName : col
          );
          
          // Update selected axes if needed
          const updatedSelected = {
            xAxis: file.selected.xAxis === originalName ? newName : file.selected.xAxis,
            yAxes: file.selected.yAxes.map(y => y === originalName ? newName : y),
          };
          
          // Update column styles
          const updatedStyles = { ...file.columnStyles };
          if (updatedStyles[originalName]) {
            updatedStyles[newName] = updatedStyles[originalName];
            delete updatedStyles[originalName];
          }
          
          // Create updated data with renamed column
          const updatedData = file.data.map(row => {
            const newRow = { ...row };
            if (originalName in newRow) {
              newRow[newName] = newRow[originalName];
              delete newRow[originalName];
            }
            return newRow;
          });
          
          return {
            ...file,
            columns: updatedColumns,
            selected: updatedSelected,
            columnStyles: updatedStyles,
            data: updatedData,
          };
        }
        return file;
      })
    );
  };
  
  const generateChart = () => {
    // Verify that we have files with selected axes
    if (files.length === 0) {
      setChartData(null);
      return;
    }
    
    const datasets: ChartData['datasets'] = [];
    
    files.forEach(file => {
      const { selected, data, columnStyles } = file;
      
      if (!selected.xAxis || selected.yAxes.length === 0) {
        return; // Skip files without proper axis selection
      }
      
      selected.yAxes.forEach(yAxis => {
        const points = data
          .filter(row => row[selected.xAxis] !== undefined && row[yAxis] !== undefined)
          .map(row => ({
            x: parseFloat(row[selected.xAxis]),
            y: parseFloat(row[yAxis]),
          }))
          .filter(point => !isNaN(point.x) && !isNaN(point.y))
          .sort((a, b) => a.x - b.x);
        
        if (points.length > 0) {
          datasets.push({
            id: `${file.id}-${yAxis}`,
            fileId: file.id,
            fileName: file.name,
            label: yAxis,
            xAxisName: selected.xAxis,
            yAxisName: yAxis,
            data: points,
            style: columnStyles[yAxis] || {
              color: getRandomColor(),
              lineStyle: 'solid',
              pointStyle: 'circle',
              showPoints: true,
              showLine: true,
            },
          });
        }
      });
    });
    
    if (datasets.length > 0) {
      setChartData({
        datasets,
      });
    } else {
      setChartData(null);
    }
  };
  
  const resetChart = () => {
    setChartData(null);
  };
  
  const getRandomColor = () => {
    const colors = [
      '#2563EB', // Primary blue
      '#0D9488', // Secondary teal
      '#7C3AED', // Accent purple
      '#10B981', // Success green
      '#F59E0B', // Warning yellow
      '#DC2626', // Error red
      '#6366F1', // Indigo
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#14B8A6', // Teal
      '#F97316', // Orange
      '#06B6D4', // Cyan
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const value = {
    files,
    chartData,
    chartOptions,
    addFile,
    removeFile,
    updateAxisSelection,
    updateLineStyle,
    updatePointStyle,
    updateColor,
    updateAxisConfig,
    renameAxis,
    generateChart,
    resetChart,
  };
  
  return (
    <VisualizationContext.Provider value={value}>
      {children}
    </VisualizationContext.Provider>
  );
};

export const useVisualization = () => {
  const context = useContext(VisualizationContext);
  if (context === undefined) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
};