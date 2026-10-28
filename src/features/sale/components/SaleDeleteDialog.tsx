import { DeleteDialog } from "@/components/DeleteDialog";

import { useDeleteSale } from "../api/sale.api.hook";

export function SaleDeleteDialog({
  open,
  setOpen,
  saleId,
  onSuccess,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saleId: string;
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useDeleteSale({
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
      onDelete={() => mutate({ saleId })}
    />
  );
}
