export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type PointStyle = 'circle' | 'square' | 'triangle' | 'none';

export interface ColumnStyle {
  color: string;
  lineStyle: LineStyle;
  pointStyle: PointStyle;
  showPoints: boolean;
  showLine: boolean;
}

export interface CSVFile {
  id: string;
  name: string;
  columns: string[];
  data: Record<string, string>[];
  selected: {
    xAxis: string;
    yAxes: string[];
  };
  columnStyles: Record<string, ColumnStyle>;
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface Dataset {
  id: string;
  fileId: string;
  fileName: string;
  label: string;
  xAxisName: string;
  yAxisName: string;
  data: DataPoint[];
  style: ColumnStyle;
}

export interface ChartData {
  datasets: Dataset[];
}

export interface AxisConfig {
  title: string;
  min?: number;
  max?: number;
  autoScale: boolean;
}

export interface ChartOptions {
  title: string;
  showLegend: boolean;
  showGrid: boolean;
  axisConfig: {
    x: AxisConfig;
    y: AxisConfig;
  };
}