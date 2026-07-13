"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function AdminStatusButton({
  endpoint,
  id,
  status,
  label,
  variant = "secondary"
}: {
  endpoint: string;
  id: string;
  status: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  async function click() {
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action: "status", status })
    });
    router.refresh();
  }
  return <Button type="button" variant={variant} onClick={click}>{label}</Button>;
}
