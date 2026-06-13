import "./ui.css";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div className={["ui-empty-state", className].filter(Boolean).join(" ")}>
      {Icon && (
        <div className="ui-empty-icon">
          <Icon size={32} />
        </div>
      )}
      {title && <h3 className="ui-empty-title">{title}</h3>}
      {description && <p className="ui-empty-description">{description}</p>}
      {action && <div className="ui-empty-action">{action}</div>}
    </div>
  );
}
