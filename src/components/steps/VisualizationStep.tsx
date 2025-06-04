import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Fade,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import { ArrowLeft, RefreshCw, Download, Share2, Image } from 'lucide-react';
import { useVisualization } from '../../contexts/VisualizationContext';
import D3LineChart from '../visualization/D3LineChart';

interface VisualizationStepProps {
  onReset: () => void;
  onBack: () => void;
}

const VisualizationStep: React.FC<VisualizationStepProps> = ({ onReset, onBack }) => {
  const { chartData, chartOptions, generateChart } = useVisualization();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateVisualization = async () => {
      setLoading(true);
      try {
        generateChart();
      } catch (error) {
        console.error('Error generating chart:', error);
      } finally {
        // Simulate loading for demo purposes
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    generateVisualization();
  }, [generateChart]);

  const handleExportSVG = () => {
    // Implementation for exporting chart as SVG
    const svgElement = document.querySelector('.d3-chart svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chart-export.svg';
      link.click();
      
      URL.revokeObjectURL(url);
    }
  };

  const handleExportPNG = () => {
    // Implementation for exporting chart as PNG would go here
    // In a full implementation, we would use canvas to render and download PNG
  };

  const handleRefreshChart = () => {
    setLoading(true);
    generateChart();
    // Simulate loading for demo purposes
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Chart Visualization
      </Typography>
      
      <Paper
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            minHeight: 400,
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}>
              <Typography variant="h5">
                {chartOptions.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh Chart">
                  <IconButton onClick={handleRefreshChart} color="primary">
                    <RefreshCw size={20} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Export as SVG">
                  <IconButton onClick={handleExportSVG} color="secondary">
                    <Download size={20} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Export as PNG">
                  <IconButton onClick={handleExportPNG} color="info">
                    <Image size={20} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Share Chart">
                  <IconButton color="success">
                    <Share2 size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {chartData && chartData.datasets.length > 0 ? (
              <Fade in={!loading} timeout={500}>
                <Box sx={{ 
                  height: 500, 
                  width: '100%',
                  className: 'd3-chart',
                }}>
                  <D3LineChart 
                    data={chartData} 
                    options={chartOptions}
                  />
                </Box>
              </Fade>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: 400,
                bgcolor: 'grey.100',
                borderRadius: 1,
              }}>
                <Typography variant="h6" color="text.secondary">
                  No data available for visualization
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>
      
      {!loading && chartData && chartData.datasets.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Dataset Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Number of Datasets:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {chartData.datasets.length}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Total Data Points:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {chartData.datasets.reduce(
                  (sum, dataset) => sum + dataset.data.length, 
                  0
                )}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Source Files:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Set(chartData.datasets.map(d => d.fileName)).size}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowLeft size={18} />}
        >
          Back to Configuration
        </Button>
        
        <Button
          variant="contained"
          onClick={onReset}
          color="secondary"
        >
          Start New Visualization
        </Button>
      </Box>
    </Box>
  );
};

export default VisualizationStep;