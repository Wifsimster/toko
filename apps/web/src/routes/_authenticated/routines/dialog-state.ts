import type { Routine } from "@focusflow/validators";

export type DialogState = {
  routineDialogOpen: boolean;
  editingRoutine: Routine | null;
  stepEditorRoutine: Routine | null;
  templatesOpen: boolean;
};
export type DialogAction =
  | { type: "openCreate" }
  | { type: "openEdit"; routine: Routine }
  | { type: "closeRoutineDialog" }
  | { type: "setStepEditor"; routine: Routine | null }
  | { type: "setTemplatesOpen"; open: boolean };

export const DIALOG_INITIAL: DialogState = {
  routineDialogOpen: false,
  editingRoutine: null,
  stepEditorRoutine: null,
  templatesOpen: false,
};

export function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "openCreate":
      return { ...state, routineDialogOpen: true, editingRoutine: null };
    case "openEdit":
      return { ...state, routineDialogOpen: true, editingRoutine: action.routine };
    case "closeRoutineDialog":
      return { ...state, routineDialogOpen: false, editingRoutine: null };
    case "setStepEditor":
      return { ...state, stepEditorRoutine: action.routine };
    case "setTemplatesOpen":
      return { ...state, templatesOpen: action.open };
    default:
      return state;
  }
}
