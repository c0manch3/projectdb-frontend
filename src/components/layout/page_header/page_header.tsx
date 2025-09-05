interface BreadcrumbItem {
  text: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

function PageHeader({ title, subtitle, breadcrumbs }: PageHeaderProps): JSX.Element {
  return (
    <div className="page-header">
      <div className="container">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumbs.map((item, index) => (
              <span key={index}>
                {item.href ? (
                  <a href={item.href} className="breadcrumbs__link">{item.text}</a>
                ) : (
                  <span className="breadcrumbs__item">{item.text}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="breadcrumbs__separator">›</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

export default PageHeader;