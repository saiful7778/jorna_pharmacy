import { useState } from "react";

import { CircleAlertIcon } from "lucide-react";

import { BIN_RETENTION_DAYS } from "@/constants/bin";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type DeleteMode = "soft" | "permanent";

interface DeleteDialogProps {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onDelete: () => void;
  isDeleteing?: boolean;
  /** `soft` moves the item to the bin; `permanent` deletes it for good. */
  mode?: DeleteMode;
  /** Days a soft-deleted item stays in the bin before it is purged. */
  retentionDays?: number;
}

export function DeleteDialog({
  openDialog,
  setOpenDialog,
  onDelete,
  isDeleteing,
  mode = "permanent",
  retentionDays = BIN_RETENTION_DAYS,
}: DeleteDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const handleDelete = () => {
    onDelete();
    setInputValue("");
  };

  const isSoft = mode === "soft";

  return (
    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="w-full text-center">
              {isSoft ? "Move to bin" : "Final confirmation"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {isSoft ? (
                <>
                  This item will be moved to the bin and permanently deleted
                  after {retentionDays} days. You can restore it from the bin
                  before then. To confirm, please enter{" "}
                  <span className="font-semibold text-foreground">CONFIRM</span>
                  .
                </>
              ) : (
                <>
                  This action cannot be undone. Are you sure to delete. To
                  confirm, please enter{" "}
                  <span className="font-semibold text-foreground">CONFIRM</span>
                  .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="space-y-5">
          <div className="*:not-first:mt-2">
            <Input
              type="text"
              placeholder="Type CONFIRM"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={
                <Button type="button" variant="outline" className="flex-1" />
              }
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              className="flex-1"
              disabled={isDeleteing || inputValue !== "CONFIRM"}
              aria-disabled={isDeleteing || inputValue !== "CONFIRM"}
              onClick={handleDelete}
            >
              {isSoft ? "Move to bin" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
