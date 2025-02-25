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

interface AddCompetencyDialogProps {
  skillName: string;
  onAddCompetency: (name: string, description: string) => void;
}

export function AddCompetencyDialog({
  skillName,
  onAddCompetency,
}: AddCompetencyDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleAdd = () => {
    if (name.trim()) {
      onAddCompetency(
        name.trim(),
        description.trim() || "Define criteria for this competency",
      );
      setName("");
      setDescription("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
          title="Add Competency"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Competency to {skillName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label
              htmlFor="competency-name"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Competency Name
            </label>
            <Input
              id="competency-name"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter competency name"
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor="competency-description"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Criterion Statement
            </label>
            <textarea
              id="competency-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter criterion statement"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verbo-blue focus:ring-offset-2"
              rows={3}
            />
          </div>
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
            Add Competency
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
