import { useIsTrialUser } from '../../../hooks/use_permissions';

/**
 * TrialBadge component displays a visual indicator for Trial users
 * Shows "Тестовый доступ" badge in the UI
 */
function TrialBadge(): JSX.Element | null {
  const isTrialUser = useIsTrialUser();

  if (!isTrialUser) {
    return null;
  }

  return (
    <div className="trial-badge">
      <span className="trial-badge__icon">🔒</span>
      <span className="trial-badge__text">Тестовый доступ</span>
    </div>
  );
}

export default TrialBadge;
