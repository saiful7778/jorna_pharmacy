import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { InputField } from "@/components/form-fields/InputField";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { FieldGroup } from "@/components/ui/field";
import { useAuthStore } from "@/zustand/auth/AuthStoreContext";

import { useProfileUpdate } from "../api/user.api.hook";
import { profileUpdateSchema, type ProfileUpdateType } from "../user.schema";

export function ProfileUpdateForm() {
  "use no memo";
  const user = useAuthStore((state) => state.user);

  const form = useForm<ProfileUpdateType>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const { mutate, isPending } = useProfileUpdate<keyof ProfileUpdateType>({
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="name"
          type="text"
          label="Name"
          placeholder="Name"
          disabled={isPending}
        />
        <InputField
          control={form.control}
          name="email"
          type="email"
          label="Email address"
          placeholder="Email Address"
          description="you can't update your email address."
          disabled
        />
        <ButtonSpinner className="w-fit" type="submit" isLoading={isPending}>
          Submit
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
