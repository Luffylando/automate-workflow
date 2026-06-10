export function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = localStorage.getItem("aw-theme");
        var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
        var dark =
          theme === "dark" ||
          (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", dark);
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
