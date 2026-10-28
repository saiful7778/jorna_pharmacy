import { DeleteDialog } from "@/components/DeleteDialog";

import { useDeletePurchase } from "../api/purchaseDelete.api.hook";

export function PurchaseDeleteDialog({
  open,
  setOpen,
  purchaseId,
  onSuccess,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseId: string;
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useDeletePurchase({
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });

  return (
    <DeleteDialog
      openDialog={open}
      setOpenDialog={setOpen}
      isDeleteing={isPending}
      mode="soft"
      onDelete={() => mutate({ purchaseId })}
    />
  );
}
