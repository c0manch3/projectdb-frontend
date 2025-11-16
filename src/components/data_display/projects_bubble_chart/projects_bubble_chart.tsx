import React, { useState } from 'react';
import type { ProjectWorkloadAnalytics } from '../../../store/types';

interface ProjectsBubbleChartProps {
  data: ProjectWorkloadAnalytics[];
  width?: number;
  height?: number;
}

function ProjectsBubbleChart({ data }: ProjectsBubbleChartProps): JSX.Element {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const getChangeClass = (changePercent: number): string => {
    if (changePercent > 0) return 'positive';
    if (changePercent < 0) return 'negative';
    return 'neutral';
  };

  const toggleExpand = (projectId: string) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  // Sort projects by employee count (descending)
  const sortedData = [...data].sort((a, b) => b.employeeCount - a.employeeCount);

  return (
    <div className="projects-analytics">
      <div className="projects-analytics__grid">
        {sortedData.map((project) => {
          const isExpanded = expandedProjectId === project.projectId;
          const changeClass = getChangeClass(project.changePercent);

          return (
            <div
              key={project.projectId}
              className={`project-analytics-card ${changeClass} ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleExpand(project.projectId)}
            >
              <div className="project-analytics-card__header">
                <h3 className="project-analytics-card__title">
                  {project.projectName}
                </h3>
                <div className={`project-analytics-card__badge ${changeClass}`}>
                  {project.changePercent >= 0 ? '+' : ''}{project.changePercent.toFixed(1)}%
                </div>
              </div>

              <div className="project-analytics-card__stats">
                <div className="project-analytics-card__stat">
                  <div className="project-analytics-card__stat-value">
                    {project.employeeCount}
                  </div>
                  <div className="project-analytics-card__stat-label">
                    Сотрудников
                  </div>
                </div>

                {project.previousEmployeeCount > 0 && (
                  <div className="project-analytics-card__stat">
                    <div className={`project-analytics-card__stat-value ${changeClass}`}>
                      {project.changePercent >= 0 ? '+' : ''}{project.employeeCount - project.previousEmployeeCount}
                    </div>
                    <div className="project-analytics-card__stat-label">
                      Изменение
                    </div>
                  </div>
                )}
              </div>

              {isExpanded && project.employees.length > 0 && (
                <div className="project-analytics-card__employees">
                  <div className="project-analytics-card__employees-title">
                    Сотрудники:
                  </div>
                  <div className="project-analytics-card__employees-list">
                    {project.employees.map((employee) => (
                      <div key={employee.userId} className="project-analytics-card__employee">
                        <span className="employee-name">
                          {employee.firstName} {employee.lastName}
                        </span>
                        <span className="employee-hours">
                          {employee.hoursWorked.toFixed(1)} ч
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="project-analytics-card__expand-hint">
                {isExpanded ? '▲ Свернуть' : '▼ Развернуть'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectsBubbleChart;
