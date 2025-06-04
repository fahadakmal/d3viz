import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown, 
  RefreshCw, 
  Settings, 
  Sliders 
} from 'lucide-react';
import { useVisualization } from '../../contexts/VisualizationContext';
import AxisSettingsPanel from '../ui/AxisSettingsPanel';
import SeriesStylePanel from '../ui/SeriesStylePanel';

interface ChartConfigurationStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ChartConfigurationStep: React.FC<ChartConfigurationStepProps> = ({ onNext, onBack }) => {
  const { files, chartOptions, updateAxisConfig } = useVisualization();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update chart title
    const newTitle = event.target.value;
    // Implementation will be added to context in a full solution
  };

  const handleToggleGrid = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Toggle grid visibility
    const showGrid = event.target.checked;
    // Implementation will be added to context in a full solution
  };

  const handleToggleLegend = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Toggle legend visibility
    const showLegend = event.target.checked;
    // Implementation will be added to context in a full solution
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configure Chart Settings
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Customize the appearance and behavior of your chart visualization.
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab 
          label="General Settings" 
          icon={<Settings size={18} />} 
          iconPosition="start"
        />
        <Tab 
          label="Axis Settings" 
          icon={<Sliders size={18} />} 
          iconPosition="start" 
        />
        <Tab 
          label="Series Styling" 
          icon={<RefreshCw size={18} />} 
          iconPosition="start" 
        />
      </Tabs>

      {tabValue === 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            General Chart Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chart Title"
                variant="outlined"
                value={chartOptions.title}
                onChange={handleTitleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={chartOptions.showGrid} 
                    onChange={handleToggleGrid}
                    color="primary"
                  />
                }
                label="Show Grid Lines"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={chartOptions.showLegend} 
                    onChange={handleToggleLegend}
                    color="primary"
                  />
                }
                label="Show Legend"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <AxisSettingsPanel 
                axis="x"
                config={chartOptions.axisConfig.x}
                onChange={(config) => updateAxisConfig('x', config)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <AxisSettingsPanel 
                axis="y"
                config={chartOptions.axisConfig.y}
                onChange={(config) => updateAxisConfig('y', config)}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Series Style Settings
          </Typography>
          
          {files.map((file) => (
            <Accordion key={file.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ChevronDown size={18} />}
              >
                <Typography>{file.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SeriesStylePanel file={file} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowLeft size={18} />}
        >
          Back to Column Selection
        </Button>
        
        <Button
          variant="contained"
          onClick={onNext}
          endIcon={<ArrowRight size={18} />}
        >
          Generate Visualization
        </Button>
      </Box>
    </Box>
  );
};

export default ChartConfigurationStep;