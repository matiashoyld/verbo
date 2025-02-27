import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface ItemToDelete {
  id: string;
  name: string;
  type: "category" | "skill" | "competency";
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToDelete: ItemToDelete | null;
  onConfirmDelete: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemToDelete,
  onConfirmDelete,
}: DeleteConfirmDialogProps) {
  if (!itemToDelete) return null;

  const { name, type } = itemToDelete;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete {type}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{name}&quot;?
            {type === "category" && (
              <span className="mt-2 block text-sm font-medium text-red-500">
                This will also delete all skills and competencies within this
                category.
              </span>
            )}
            {type === "skill" && (
              <span className="mt-2 block text-sm font-medium text-red-500">
                This will also delete all competencies within this skill.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirmDelete();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
