import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ProjectWorkloadAnalytics, EmployeeWorkload } from '../../../store/types';

interface ProjectsBubbleChartProps {
  data: ProjectWorkloadAnalytics[];
  width?: number;
  height?: number;
}

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  value: number;
  changePercent: number;
  employees: EmployeeWorkload[];
  radius: number;
}

function ProjectsBubbleChart({ data, width = 1000, height = 700 }: ProjectsBubbleChartProps): JSX.Element {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredProject, setHoveredProject] = useState<ProjectWorkloadAnalytics | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const centerX = width / 2;
    const centerY = height / 2;

    // Create bubble nodes
    const maxEmployees = d3.max(data, d => d.employeeCount) || 1;
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxEmployees])
      .range([20, 80]);

    const nodes: BubbleNode[] = data.map(project => ({
      id: project.projectId,
      name: project.projectName,
      value: project.employeeCount,
      changePercent: project.changePercent,
      employees: project.employees,
      radius: radiusScale(project.employeeCount),
      x: centerX + (Math.random() - 0.5) * width * 0.8,
      y: centerY + (Math.random() - 0.5) * height * 0.8
    }));

    // Color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([-50, 0, 50])
      .range(['#ef4444', '#6b7280', '#22c55e'])
      .clamp(true);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(10))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide<BubbleNode>().radius(d => d.radius + 2))
      .force('x', d3.forceX(centerX).strength(0.05))
      .force('y', d3.forceY(centerY).strength(0.05));

    // Create groups for each bubble
    const bubbles = svg.selectAll<SVGGElement, BubbleNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'bubble-group')
      .style('cursor', 'pointer');

    // Add circles
    bubbles.append('circle')
      .attr('class', 'bubble')
      .attr('r', d => d.radius)
      .attr('fill', d => colorScale(d.changePercent))
      .attr('fill-opacity', 0.7)
      .attr('stroke', d => colorScale(d.changePercent))
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 1);

    // Add project names
    bubbles.append('text')
      .attr('class', 'bubble-name')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .style('fill', '#fff')
      .style('font-size', d => `${Math.max(10, d.radius / 3)}px`)
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name);

    // Add change percent
    bubbles.append('text')
      .attr('class', 'bubble-percent')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('fill', '#fff')
      .style('font-size', d => `${Math.max(9, d.radius / 4)}px`)
      .style('font-weight', '500')
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
        }

        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('stroke-width', 4)
          .attr('fill-opacity', 0.9);
      })
      .on('mouseleave', function() {
        setHoveredProject(null);

        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('stroke-width', 2)
          .attr('fill-opacity', 0.7);
      })
      .on('mousemove', (event) => {
        if (tooltipRef.current && hoveredProject) {
          const tooltip = tooltipRef.current;
          tooltip.style.left = `${event.pageX + 15}px`;
          tooltip.style.top = `${event.pageY + 15}px`;
        }
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      bubbles.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Stop simulation after it settles
    simulation.alpha(1).restart();
    setTimeout(() => simulation.stop(), 3000);

    return () => {
      simulation.stop();
    };
  }, [data, width, height, hoveredProject]);

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
              {hoveredProject.employees.map((employee, index) => (
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
