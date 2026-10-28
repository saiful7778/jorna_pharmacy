import { DeleteDialog } from "@/components/DeleteDialog";

import { useCompanyDelete } from "../api/companyDelete.api.hook";

export function CompanyDeleteDialog({
  open,
  setOpen,
  companyId,
  onSuccess,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  companyId: string;
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useCompanyDelete({
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
      onDelete={() => mutate({ companyId })}
    />
  );
}
