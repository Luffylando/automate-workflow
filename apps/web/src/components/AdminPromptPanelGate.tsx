import { getAdminSession } from "@/lib/server-api";
import { AdminPromptPanel } from "./AdminPromptPanel";

export async function AdminPromptPanelGate() {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return null;
  }

  return <AdminPromptPanel />;
}
