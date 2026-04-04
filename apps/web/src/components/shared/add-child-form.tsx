import { ChildForm } from "./child-form";

/** @deprecated Use `ChildForm` directly. Kept for backwards compatibility. */
export function AddChildForm({ onSuccess }: { onSuccess: () => void }) {
  return <ChildForm onSuccess={onSuccess} />;
}
