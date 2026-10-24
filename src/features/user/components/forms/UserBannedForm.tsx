import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { createClientOnlyFn } from "@tanstack/react-start";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

import { DateTimePickerField } from "@/components/form-fields/DateTimePickerField";
import { InputField } from "@/components/form-fields/InputField";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/features/auth/auth.client";
import type { UserBannedType } from "@/features/auth/auth.schema";
import { userBannedSchema } from "@/features/auth/auth.schema";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

interface UserBannedFormProps {
  initialData: UserBannedType;
  onSuccess?: () => void;
}

export function UserBannedForm({
  initialData,
  onSuccess,
}: UserBannedFormProps) {
  "use no memo";
  const [isLoading, setIsLoading] = useState(false);
  const toastId = "ban_unbanned_user_toast_message";

  const user = useAuthStore((state) => state.user);
  const form = useForm<UserBannedType>({
    resolver: zodResolver(userBannedSchema),
    defaultValues: initialData,
  });

  const handleSubmit = createClientOnlyFn(async (e: UserBannedType) => {
    if (e.banned) {
      let banExpiresIn: number = 60 * 60 * 24 * 10;

      if (e.banExpires) {
        banExpiresIn = e.banExpires.getTime() - Date.now();
      }

      await authClient.admin.banUser({
        userId: e.userId,
        banExpiresIn,
        banReason: e.banReason,
        fetchOptions: {
          onRequest: () => {
            setIsLoading(true);
            toast.loading("Loading...", { id: toastId });
          },
          onSuccess: () => {
            setIsLoading(false);
            onSuccess?.();
            toast.success("User has been banned successfully.", {
              id: toastId,
            });
          },
          onError: ({ error }) => {
            setIsLoading(false);
            toast.error(error.message, { id: toastId });
          },
        },
      });
    } else {
      await authClient.admin.unbanUser({
        userId: e.userId,
        fetchOptions: {
          onRequest: () => {
            setIsLoading(true);
            toast.loading("Loading...", { id: toastId });
          },
          onSuccess: () => {
            setIsLoading(false);
            onSuccess?.();
            toast.success("User has been unbanned successfully.", {
              id: toastId,
            });
          },
          onError: ({ error }) => {
            setIsLoading(false);
            toast.error(error.message, { id: toastId });
          },
        },
      });
    }
  });

  const isBanned = useWatch({
    control: form.control,
    name: "banned",
  });

  return (
    <div className="rounded-md border p-3 pt-0 shadow">
      <h5 className="-mt-3 w-fit bg-background px-2 text-sm font-medium">
        Banned Settings
      </h5>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2">
        <FieldGroup>
          <Controller
            control={form.control}
            name="banned"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState}>
                <div className="flex h-10 flex-row items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-base selection:bg-primary dark:bg-input/30">
                  <FieldLabel htmlFor="banned" aria-disabled={isLoading}>
                    Banned
                  </FieldLabel>
                  <div className="flex w-auto items-center justify-end">
                    <Switch
                      id="banned"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          form.setValue("banReason", undefined);
                          form.setValue("banExpires", undefined);
                        }
                      }}
                      disabled={isLoading}
                      aria-disabled={isLoading}
                    />
                  </div>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {isBanned && (
            <>
              <InputField
                control={form.control}
                name="banReason"
                placeholder="Banned Reason"
                disabled={isLoading}
              />
              <DateTimePickerField
                control={form.control}
                name="banExpires"
                placeholder="Banned Expires"
                timezone={user.timezone}
                disabled={isLoading}
                showTimeSelection={false}
                calendarProps={{
                  disabled: {
                    before: new Date(),
                  },
                }}
              />
            </>
          )}
          <div className="text-right">
            <Button
              disabled={!form.formState.isDirty || isLoading}
              aria-disabled={!form.formState.isDirty || isLoading}
              type="submit"
            >
              {isLoading ? <Spinner /> : "Update"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
