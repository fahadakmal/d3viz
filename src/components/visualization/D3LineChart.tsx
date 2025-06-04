import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartData, ChartOptions, Dataset, DataPoint } from '../../types/visualization';

interface D3LineChartProps {
  data: ChartData;
  options: ChartOptions;
}

const D3LineChart: React.FC<D3LineChartProps> = ({ data, options }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !data.datasets || data.datasets.length === 0) return;

    // Clear existing chart
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll('*').remove();
    }

    // Chart dimensions and margins
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    const svgWidth = svgRef.current?.parentElement?.clientWidth || 800;
    const svgHeight = 500;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(svgRef.current)
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Find min and max values for scales
    const allPoints = data.datasets.flatMap(dataset => dataset.data);
    
    let xMin = d3.min(allPoints, d => d.x) || 0;
    let xMax = d3.max(allPoints, d => d.x) || 100;
    let yMin = d3.min(allPoints, d => d.y) || 0;
    let yMax = d3.max(allPoints, d => d.y) || 100;
    
    // Add padding to the ranges
    const xPadding = (xMax - xMin) * 0.05;
    const yPadding = (yMax - yMin) * 0.05;
    
    // Apply manual axis ranges if specified and auto-scale is disabled
    if (!options.axisConfig.x.autoScale && 
        options.axisConfig.x.min !== undefined && 
        options.axisConfig.x.max !== undefined) {
      xMin = options.axisConfig.x.min;
      xMax = options.axisConfig.x.max;
    } else {
      xMin = xMin - xPadding;
      xMax = xMax + xPadding;
    }
    
    if (!options.axisConfig.y.autoScale && 
        options.axisConfig.y.min !== undefined && 
        options.axisConfig.y.max !== undefined) {
      yMin = options.axisConfig.y.min;
      yMax = options.axisConfig.y.max;
    } else {
      yMin = yMin - yPadding;
      yMax = yMax + yPadding;
    }

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    // Add Y axis
    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add axis labels
    svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(options.axisConfig.x.title);

    svg.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(options.axisConfig.y.title);

    // Add grid lines if enabled
    if (options.showGrid) {
      // Add X grid lines
      svg.append('g')
        .attr('class', 'grid x-grid')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3.axisBottom(xScale)
            .tickSize(-height)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .style('stroke', '#e0e0e0')
        .style('stroke-opacity', 0.7);

      // Add Y grid lines
      svg.append('g')
        .attr('class', 'grid y-grid')
        .call(
          d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .style('stroke', '#e0e0e0')
        .style('stroke-opacity', 0.7);
    }

    // Create line generator
    const line = d3.line<DataPoint>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX); // Smoothed line

    // Function to determine line dash pattern based on style
    const getDashArray = (lineStyle: string): string => {
      switch (lineStyle) {
        case 'dashed':
          return '5,5';
        case 'dotted':
          return '2,2';
        default:
          return '';
      }
    };

    // Function to get point symbol based on style
    const getPointSymbol = (pointStyle: string) => {
      switch (pointStyle) {
        case 'square':
          return d3.symbol().type(d3.symbolSquare).size(60);
        case 'triangle':
          return d3.symbol().type(d3.symbolTriangle).size(80);
        case 'circle':
        default:
          return d3.symbol().type(d3.symbolCircle).size(60);
      }
    };

    // Draw lines for each dataset
    data.datasets.forEach(dataset => {
      const { style } = dataset;
      
      // Only draw line if showLine is true
      if (style.showLine) {
        svg.append('path')
          .datum(dataset.data)
          .attr('fill', 'none')
          .attr('stroke', style.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', getDashArray(style.lineStyle))
          .attr('d', line)
          .attr('class', `line-${dataset.id}`)
          .style('opacity', 0)
          .transition()
          .duration(1000)
          .style('opacity', 1);
      }
      
      // Only draw points if showPoints is true and pointStyle is not 'none'
      if (style.showPoints && style.pointStyle !== 'none') {
        const pointSymbol = getPointSymbol(style.pointStyle);
        
        svg.selectAll(`.point-${dataset.id}`)
          .data(dataset.data)
          .enter()
          .append('path')
          .attr('class', `point-${dataset.id}`)
          .attr('d', pointSymbol)
          .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`)
          .attr('fill', style.color)
          .style('opacity', 0)
          .transition()
          .delay((_, i) => i * 50) // Staggered animation
          .duration(500)
          .style('opacity', 1);
      }
    });

    // Add legend if enabled
    if (options.showLegend) {
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + 10}, 0)`);

      data.datasets.forEach((dataset, i) => {
        const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${i * 25})`);

        // Legend color box
        legendItem.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', dataset.style.color);

        // Legend text
        legendItem.append('text')
          .attr('x', 24)
          .attr('y', 12)
          .text(dataset.label)
          .style('font-size', '12px');
      });
    }

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Add a transparent overlay for better tooltip handling
    const overlay = svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    // Mouse move handler for tooltip
    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      const xValue = xScale.invert(mouseX);

      // Find the closest point in each dataset
      const closestPoints: { dataset: Dataset; point: DataPoint; distance: number }[] = [];

      data.datasets.forEach(dataset => {
        const closest = dataset.data.reduce((prev, curr) => {
          const prevDistance = Math.abs(prev.x - xValue);
          const currDistance = Math.abs(curr.x - xValue);
          return prevDistance < currDistance ? prev : curr;
        });

        const distance = Math.abs(closest.x - xValue);
        if (distance < (xMax - xMin) * 0.05) { // Only show if mouse is close enough
          closestPoints.push({ dataset, point: closest, distance });
        }
      });

      if (closestPoints.length > 0) {
        // Sort by distance to prioritize closest points
        closestPoints.sort((a, b) => a.distance - b.distance);

        // Build tooltip content
        let tooltipContent = `<div style="font-weight:bold;margin-bottom:5px;">X: ${closestPoints[0].point.x.toFixed(2)}</div>`;
        
        closestPoints.forEach(({ dataset, point }) => {
          tooltipContent += `
            <div style="display:flex;align-items:center;margin-top:3px;">
              <div style="width:10px;height:10px;background:${dataset.style.color};margin-right:5px;"></div>
              <div>${dataset.label}: ${point.y.toFixed(2)}</div>
            </div>
          `;
        });

        // Show and position tooltip
        tooltip
          .html(tooltipContent)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 28}px`)
          .transition()
          .duration(200)
          .style('opacity', 0.9);

        // Highlight points
        closestPoints.forEach(({ dataset, point }) => {
          // Highlight the point
          svg.selectAll(`.point-${dataset.id}`)
            .filter(d => d.x === point.x && d.y === point.y)
            .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)}) scale(1.5)`);
        });
      }
    });

    overlay.on('mouseout', () => {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);

      // Reset all points to normal size
      svg.selectAll('[class^="point-"]')
        .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)}) scale(1)`);
    });

    // Cleanup on unmount
    return () => {
      d3.select('body').selectAll('.d3-tooltip').remove();
    };
  }, [data, options]);

  return (
    <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
  );
};

export default D3LineChart;