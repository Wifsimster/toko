import { ChildForm } from "./child-form";

export function AddChildForm({ onSuccess }: { onSuccess: () => void }) {
  return <ChildForm onSuccess={onSuccess} />;
}
