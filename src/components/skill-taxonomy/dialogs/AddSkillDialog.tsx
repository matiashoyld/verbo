import { Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

interface AddSkillDialogProps {
  categoryName: string;
  onAddSkill: (name: string) => void;
}

export function AddSkillDialog({
  categoryName,
  onAddSkill,
}: AddSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleAdd = () => {
    if (name.trim()) {
      onAddSkill(name.trim());
      setName("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-900"
          title="Add Skill"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Skill to {categoryName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter skill name"
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="gap-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim()}
            className="gap-2 bg-verbo-dark text-white hover:bg-verbo-dark/90"
          >
            Add Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
