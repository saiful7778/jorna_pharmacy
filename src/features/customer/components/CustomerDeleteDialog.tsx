import { DeleteDialog } from "@/components/DeleteDialog";

import { useDeleteCustomer } from "../api/customerDelete.api.hook";

export function CustomerDeleteDialog({
  open,
  setOpen,
  customerId,
  onSuccess,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  customerId: string;
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useDeleteCustomer({
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
      onDelete={() => mutate({ customerId })}
    />
  );
}
