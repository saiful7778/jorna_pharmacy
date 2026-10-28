import { DeleteDialog } from "@/components/DeleteDialog";

import { useDeleteCompanyPurchase } from "../api/companyPurchaseDelete.api.hook";

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
  const { mutate, isPending } = useDeleteCompanyPurchase({
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
