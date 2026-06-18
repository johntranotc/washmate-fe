import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function PlaceholderPageContent({ title, description, icon, note }) {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link
        to="/khach-hang"
        className="mb-8 inline-flex items-center gap-2 font-semibold text-primary transition-all hover:gap-3"
      >
        <ArrowLeft size={20} /> Quay lại Tổng quan
      </Link>
      <Card className="rounded-3xl border border-border bg-white p-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-primary/10 p-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center text-primary">{icon}</div>
          </div>
        </div>
        <h1 className="mb-3 text-4xl font-bold text-foreground">{title}</h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">{description}</p>
        <div className="mb-8 rounded-2xl border border-border bg-secondary p-4">
          <p className="text-sm font-medium text-muted-foreground">{note}</p>
        </div>
        <Button
          render={<Link to="/khach-hang" />}
          className="rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-brand-dark"
        >
          Quay lại Tổng quan
        </Button>
      </Card>
    </div>
  );
}
