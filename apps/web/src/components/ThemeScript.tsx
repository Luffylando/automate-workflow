"use client";

import { useServerInsertedHTML } from "next/navigation";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export function ThemeScript() {
  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
      suppressHydrationWarning
    />
  ));

  return null;
}
