import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/form-fields/SelectField";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  RoleEnumSchema,
  type RoleEnumType,
} from "@/db/schemas/enums/zod-db-enums";
import { formatEnumValue } from "@/utils/formatEnum";

import { useRoleUpdate } from "../../api/user.api.hook";
import type { RoleUpdateType } from "../../user.schema";
import { roleUpdateSchema } from "../../user.schema";

export function UserRoleUpdateForm({
  userId,
  roleName,
  onSuccess,
}: {
  userId: string;
  roleName: RoleEnumType;
  onSuccess?: () => void;
}) {
  "use no memo";

  const form = useForm<RoleUpdateType>({
    resolver: zodResolver(roleUpdateSchema),
    defaultValues: {
      userId,
      roleName,
    },
  });

  const { mutate, isPending } = useRoleUpdate<keyof RoleUpdateType>({
    onSuccess: () => {
      onSuccess?.();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = async (e: RoleUpdateType) => {
    mutate(e);
  };

  return (
    <div className="rounded-md border p-3 pt-0 shadow">
      <h5 className="-mt-3 w-fit bg-background px-2 text-sm font-medium">
        Role update
      </h5>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2">
        <FieldGroup>
          <SelectField
            control={form.control}
            name="roleName"
            placeholder="Role"
            label="User Role"
            disabled={isPending}
            options={RoleEnumSchema.options.map((value) => ({
              value,
              label: formatEnumValue(value),
            }))}
          />
          <div className="text-right">
            <Button
              disabled={!form.formState.isDirty || isPending}
              aria-disabled={!form.formState.isDirty || isPending}
              type="submit"
            >
              {isPending ? <Spinner /> : "Submit"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
