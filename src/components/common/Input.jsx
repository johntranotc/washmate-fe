import { useId } from "react";
import "./ui.css";

export default function Input({
  label,
  icon: Icon,
  error,
  helperText,
  id,
  className = "",
  containerClassName = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div
      className={[
        "ui-field",
        error ? "ui-field-error-state" : "",
        containerClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label className="ui-field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="ui-field-wrap">
        {Icon && <Icon size={18} className="ui-field-icon" />}
        <input
          id={inputId}
          className={["ui-field-input", className].filter(Boolean).join(" ")}
          {...props}
        />
      </div>
      {error ? (
        <span className="ui-field-error">{error}</span>
      ) : helperText ? (
        <span className="ui-field-helper">{helperText}</span>
      ) : null}
    </div>
  );
}
