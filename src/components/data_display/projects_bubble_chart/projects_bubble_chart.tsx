import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ProjectWorkloadAnalytics, EmployeeWorkload } from '../../../store/types';

interface ProjectsBubbleChartProps {
  data: ProjectWorkloadAnalytics[];
  width?: number;
  height?: number;
}

interface BubbleNode {
  id: string;
  name: string;
  value: number;
  changePercent: number;
  employees: EmployeeWorkload[];
  radius: number;
  x: number;
  y: number;
}

function ProjectsBubbleChart({ data, width = 1000, height = 600 }: ProjectsBubbleChartProps): JSX.Element {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredProject, setHoveredProject] = useState<ProjectWorkloadAnalytics | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const padding = 100;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Create bubble nodes with static positioning using circle packing
    const maxEmployees = d3.max(data, d => d.employeeCount) || 1;
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxEmployees])
      .range([30, 60]);

    // Simple grid layout for fast rendering
    const cols = Math.ceil(Math.sqrt(data.length));
    const rows = Math.ceil(data.length / cols);
    const cellWidth = chartWidth / cols;
    const cellHeight = chartHeight / rows;

    const nodes: BubbleNode[] = data.map((project, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        id: project.projectId,
        name: project.projectName,
        value: project.employeeCount,
        changePercent: project.changePercent,
        employees: project.employees,
        radius: radiusScale(project.employeeCount),
        x: padding + col * cellWidth + cellWidth / 2,
        y: padding + row * cellHeight + cellHeight / 2
      };
    });

    // Color scale matching project theme
    const getColor = (changePercent: number): string => {
      if (changePercent > 0) return 'var(--success)';
      if (changePercent < 0) return 'var(--error)';
      return 'var(--text-secondary)';
    };

    // Create groups for each bubble
    const bubbles = svg.selectAll<SVGGElement, BubbleNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'bubble-group')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    // Add circles
    bubbles.append('circle')
      .attr('class', 'bubble')
      .attr('r', d => d.radius)
      .attr('fill', d => getColor(d.changePercent))
      .attr('fill-opacity', 0.15)
      .attr('stroke', d => getColor(d.changePercent))
      .attr('stroke-width', 2);

    // Add project names
    bubbles.append('text')
      .attr('class', 'bubble-name')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .style('fill', 'var(--text-primary)')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name);

    // Add employee count
    bubbles.append('text')
      .attr('class', 'bubble-count')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.8em')
      .style('fill', 'var(--text-primary)')
      .style('font-size', '14px')
      .style('font-weight', '700')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.value);

    // Add change percent
    bubbles.append('text')
      .attr('class', 'bubble-percent')
      .attr('text-anchor', 'middle')
      .attr('dy', '2em')
      .style('fill', d => getColor(d.changePercent))
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => {
        const sign = d.changePercent >= 0 ? '+' : '';
        return `${sign}${d.changePercent.toFixed(1)}%`;
      });

    // Mouse events
    bubbles
      .on('mouseenter', function(event, d) {
        const project = data.find(p => p.projectId === d.id);
        if (project) {
          setHoveredProject(project);
          setTooltipPos({ x: event.pageX, y: event.pageY });
        }

        d3.select(this).select('circle')
          .attr('stroke-width', 3)
          .attr('fill-opacity', 0.25);
      })
      .on('mouseleave', function() {
        setHoveredProject(null);

        d3.select(this).select('circle')
          .attr('stroke-width', 2)
          .attr('fill-opacity', 0.15);
      })
      .on('mousemove', (event) => {
        setTooltipPos({ x: event.pageX, y: event.pageY });
      });

  }, [data, width, height]);

  return (
    <div className="projects-bubble-chart">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="projects-bubble-chart__svg"
      />

      {hoveredProject && (
        <div
          ref={tooltipRef}
          className="projects-bubble-chart__tooltip"
          style={{
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y + 15}px`
          }}
        >
          <div className="tooltip__header">
            <strong>{hoveredProject.projectName}</strong>
          </div>
          <div className="tooltip__stats">
            <div>
              Сотрудников: <strong>{hoveredProject.employeeCount}</strong>
              {hoveredProject.previousEmployeeCount > 0 && (
                <span className={hoveredProject.changePercent >= 0 ? 'positive' : 'negative'}>
                  {' '}({hoveredProject.changePercent >= 0 ? '+' : ''}{hoveredProject.employeeCount - hoveredProject.previousEmployeeCount} от предыдущего дня)
                </span>
              )}
            </div>
          </div>
          <div className="tooltip__employees">
            <div className="tooltip__employees-title">Сотрудники:</div>
            <div className="tooltip__employees-list">
              {hoveredProject.employees.map((employee) => (
                <div key={employee.userId} className="tooltip__employee">
                  • {employee.firstName} {employee.lastName} — {employee.hoursWorked.toFixed(1)} ч
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsBubbleChart;
