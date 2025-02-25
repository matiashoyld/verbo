import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  itemName: string;
  itemType: "category" | "skill" | "competency";
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  setOpen,
  itemName,
  itemType,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete {itemType}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{itemName}&quot;?
            {itemType === "category" && (
              <span className="mt-2 block text-sm font-medium text-red-500">
                This will also delete all skills and competencies within this
                category.
              </span>
            )}
            {itemType === "skill" && (
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
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
