import "./ui.css";

export default function Card({ children, className = "", ...props }) {
  return (
    <div className={["ui-card", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div
      className={["ui-card-header", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3
      className={["ui-card-title", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p
      className={["ui-card-description", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardBody({ children, className = "", ...props }) {
  return (
    <div
      className={["ui-card-body", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div
      className={["ui-card-footer", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
