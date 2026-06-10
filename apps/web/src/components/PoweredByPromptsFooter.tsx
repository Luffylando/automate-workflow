import { FOOTER_BAR_CLASS } from "@/lib/theme-classes";

export function PoweredByPromptsFooter() {
  return (
    <footer className={FOOTER_BAR_CLASS}>
      <span className="text-muted">Powered by </span>
      <span className="font-semibold brand-gradient-text">prompts</span>
    </footer>
  );
}
