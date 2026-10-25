import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Asterisk, Info, UserSearch, X } from "lucide-react";
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import { UserAvatar } from "@/components/UserAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  SearchableSelector,
  SearchableSelectorContent,
  SearchableSelectorEmpty,
  SearchableSelectorItem,
  SearchableSelectorLoadingSkeleton,
  SearchableSelectorTrigger,
} from "@/components/ui/searchable-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE_INDEX } from "@/constants";
import { orpcTQClient } from "@/oRPC/orpc";
import { resolveUserImage } from "@/utils/resolveUserImage";
import { strInitials } from "@/utils/strInitials";

interface UserSelectorFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  fetchApi?: boolean;
}

export function UserSelectorField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField,
  disabled = false,
  multiple = false,
  fetchApi = false,
}: UserSelectorFieldProps<TFieldValues>) {
  const fieldId = useId();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={fieldId} aria-disabled={disabled}>
              {label}
              {requiredField && (
                <Asterisk className="-mt-2 size-3 text-destructive" />
              )}
            </FieldLabel>
          )}
          <UserSelectorFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
            disabled={disabled}
            multiple={multiple}
            fetchApi={fetchApi}
          />
          {description && (
            <FieldDescription
              className="flex items-start gap-1.5"
              aria-disabled={disabled}
            >
              {isDescriptionInfoIconShow && <Info className="mt-0.5 size-4" />}
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

interface UserSelectorFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  disabled?: boolean;
  multiple: boolean;
  placeholder?: string;
  fetchApi?: boolean;
}

function UserSelectorFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  disabled = false,
  multiple,
  placeholder = multiple ? "Select Users" : "Select User",
  fetchApi = false,
}: UserSelectorFieldRenderProps<TFieldValues>) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.user.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "email"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
      enabled: fetchApi,
      select: (result) => result.data,
    })
  );

  type UserItem = NonNullable<typeof data>[number];

  const [knownUsers, setKnownUsers] = useState<Map<string, UserItem>>(
    () => new Map()
  );

  useEffect(() => {
    if (!data) return;
    queueMicrotask(() => {
      setKnownUsers((prev) => {
        let changed = false;
        const next = new Map(prev);
        for (const user of data) {
          if (!next.has(user.id)) {
            next.set(user.id, user);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    });
  }, [data]);

  const fieldValue = field.value as string | Array<string> | undefined;

  const selectedIds: Array<string> = useMemo(
    () =>
      Array.isArray(fieldValue) ? fieldValue : fieldValue ? [fieldValue] : [],
    [fieldValue]
  );

  const selectedUsers = selectedIds
    .map((userId) => knownUsers.get(userId))
    .filter((user): user is UserItem => Boolean(user));

  const handleOnChange = useCallback(
    (value: string | Array<string> | undefined) => {
      field.onChange(value);
    },
    [field]
  );

  const removeUser = useCallback(
    (userId: string) => {
      field.onChange(selectedIds.filter((selectedId) => selectedId !== userId));
    },
    [field, selectedIds]
  );

  return (
    <div>
      {multiple && selectedUsers.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedUsers.map((user) => (
            <span
              key={user.id}
              className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-1 py-1 text-xs"
            >
              <Avatar className="size-5">
                <AvatarImage
                  src={resolveUserImage(user.image)}
                  alt={user.name}
                />
                <AvatarFallback className="text-xs font-semibold uppercase">
                  {strInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-32 truncate">{user.name}</span>
              <button
                type="button"
                onClick={() => removeUser(user.id)}
                disabled={disabled}
                aria-label={`Remove ${user.name}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <SearchableSelector
        multiple={multiple}
        value={multiple ? selectedIds : fieldValue}
        onChange={handleOnChange}
        onSearch={setSearch}
        disabled={disabled}
      >
        <SearchableSelectorTrigger id={id} aria-invalid={fieldState.invalid}>
          <UserSearch className="size-4" />
          {multiple ? (
            selectedIds.length > 0 ? (
              <span className="truncate">{`${selectedIds.length} selected`}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )
          ) : selectedIds[0] ? (
            <span className="truncate">
              {knownUsers.get(selectedIds[0])?.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </SearchableSelectorTrigger>
        <SearchableSelectorContent
          data={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          title={placeholder}
          description={multiple ? "Select users" : "Select a user"}
          loadingFallback={
            <SearchableSelectorLoadingSkeleton>
              <Skeleton className="h-8" />
            </SearchableSelectorLoadingSkeleton>
          }
          emptyFallback={
            <SearchableSelectorEmpty
              message="No users found"
              icon={<UserSearch className="size-8 opacity-20" />}
            />
          }
        >
          {(item) => (
            <SearchableSelectorItem item={item} getItemId={(user) => user.id}>
              <UserAvatar
                userName={item.name}
                userEmail={item.email}
                imageUrl={item.image}
                userRoles={item.roles}
                showDetails
                showRoleDetails
              />
            </SearchableSelectorItem>
          )}
        </SearchableSelectorContent>
      </SearchableSelector>
    </div>
  );
}
