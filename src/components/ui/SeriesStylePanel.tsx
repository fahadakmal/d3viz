import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  TextField,
} from '@mui/material';
import { CSVFile, LineStyle, PointStyle } from '../../types/visualization';
import { useVisualization } from '../../contexts/VisualizationContext';

interface SeriesStylePanelProps {
  file: CSVFile;
}

const SeriesStylePanel: React.FC<SeriesStylePanelProps> = ({ file }) => {
  const { updateLineStyle, updatePointStyle, updateColor, renameAxis } = useVisualization();
  const [selectedColumn, setSelectedColumn] = useState<string>(
    file.selected.yAxes.length > 0 ? file.selected.yAxes[0] : ''
  );
  const [newName, setNewName] = useState<string>('');

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column);
    setNewName(''); // Reset new name input when column changes
  };

  const handleLineStyleChange = (value: LineStyle) => {
    if (selectedColumn) {
      updateLineStyle(file.id, selectedColumn, value);
    }
  };

  const handlePointStyleChange = (value: PointStyle) => {
    if (selectedColumn) {
      updatePointStyle(file.id, selectedColumn, value);
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedColumn) {
      updateColor(file.id, selectedColumn, event.target.value);
    }
  };

  const handleShowPointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedColumn && file.columnStyles[selectedColumn]) {
      // Implementation in a full solution would update this property
    }
  };

  const handleShowLineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedColumn && file.columnStyles[selectedColumn]) {
      // Implementation in a full solution would update this property
    }
  };

  const handleRenameColumn = () => {
    if (selectedColumn && newName.trim()) {
      renameAxis(file.id, selectedColumn, newName.trim());
      setSelectedColumn(newName.trim());
      setNewName('');
    }
  };

  // Get style for the selected column
  const columnStyle = selectedColumn ? file.columnStyles[selectedColumn] : null;

  if (!file.selected.yAxes.length) {
    return (
      <Typography variant="body2\" color="text.secondary">
        No Y-axis columns selected for this file.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Select Column to Style:
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {file.selected.yAxes.map((column) => (
          <Chip
            key={column}
            label={column}
            onClick={() => handleColumnSelect(column)}
            variant={selectedColumn === column ? "filled" : "outlined"}
            color={selectedColumn === column ? "primary" : "default"}
            sx={{ px: 1 }}
          />
        ))}
      </Box>
      
      {selectedColumn && columnStyle && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Line Properties
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id={`line-style-${file.id}-${selectedColumn}`}>
                  Line Style
                </InputLabel>
                <Select
                  labelId={`line-style-${file.id}-${selectedColumn}`}
                  value={columnStyle.lineStyle}
                  onChange={(e) => handleLineStyleChange(e.target.value as LineStyle)}
                  label="Line Style"
                >
                  <MenuItem value="solid">Solid</MenuItem>
                  <MenuItem value="dashed">Dashed</MenuItem>
                  <MenuItem value="dotted">Dotted</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={columnStyle.showLine} 
                    onChange={handleShowLineChange}
                    color="primary"
                  />
                }
                label="Show Line"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Point Properties
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id={`point-style-${file.id}-${selectedColumn}`}>
                  Point Style
                </InputLabel>
                <Select
                  labelId={`point-style-${file.id}-${selectedColumn}`}
                  value={columnStyle.pointStyle}
                  onChange={(e) => handlePointStyleChange(e.target.value as PointStyle)}
                  label="Point Style"
                >
                  <MenuItem value="circle">Circle</MenuItem>
                  <MenuItem value="square">Square</MenuItem>
                  <MenuItem value="triangle">Triangle</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={columnStyle.showPoints} 
                    onChange={handleShowPointsChange}
                    color="primary"
                  />
                }
                label="Show Points"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Color & Labeling
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Series Color"
                    type="color"
                    value={columnStyle.color}
                    onChange={handleColorChange}
                    fullWidth
                    sx={{
                      '& input': {
                        height: 40,
                        padding: 1,
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Rename Column"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      fullWidth
                      placeholder={selectedColumn}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Button 
                        variant="contained" 
                        onClick={handleRenameColumn}
                        disabled={!newName.trim()}
                        size="small"
                      >
                        Rename
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

// Import Button as it was missing
import { Button } from '@mui/material';

export default SeriesStylePanel;