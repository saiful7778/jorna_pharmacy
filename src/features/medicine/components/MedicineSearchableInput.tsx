import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Bandage,
  Droplet,
  FlaskRound,
  Package,
  Pill,
  PillBottle,
  Search,
  Syringe,
  type LucideIcon,
} from "lucide-react";

import {
  SearchableInput,
  type SearchableInputProps,
} from "@/components/ui/searchable-input";
import { DEFAULT_PAGE_INDEX } from "@/constants";
import type { MedicineTypeEnumType } from "@/db/schemas/enums/zod-db-enums";
import { orpcTQClient } from "@/oRPC/orpc";

import type { ListMedicineForSearchContractType } from "../api/medicine.contract";

export type MedicineOptionType =
  ListMedicineForSearchContractType["output"]["data"][number];

const getOptionLabel = (medicine: MedicineOptionType) => medicine.name;

export interface MedicineSearchableInputProps extends Omit<
  SearchableInputProps<MedicineOptionType>,
  | "getOptionLabel"
  | "getOptionKey"
  | "options"
  | "renderOption"
  | "onSearch"
  | "firstAddon"
  | "secondAddon"
> {
  companyId?: string;
  showAddon?: boolean;
  onReset?: () => void;
}

const MEDICINE_TYPE_ICONS: Record<MedicineTypeEnumType, LucideIcon> = {
  tablet: Pill,
  capsule: PillBottle,
  syrup: FlaskRound,
  drop: Droplet,
  injection: Syringe,
  cream: Bandage,
  other: Package,
};

export function MedicineSearchableInput({
  placeholder = "Search Medicine",
  onChange,
  onValueChange,
  onReset,
  companyId,
  showAddon = true,
  defaultOpen = false,
  ...props
}: MedicineSearchableInputProps) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data } = useQuery(
    orpcTQClient.medicine.listForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "genericName", "strength"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
        filter: {
          companyId,
        },
      },
      enabled: defaultOpen || Boolean(search?.trim()),
      select: (result) => result.data,
    })
  );

  return (
    <SearchableInput
      {...props}
      defaultOpen={defaultOpen}
      firstAddon={showAddon && <Search className="size-4" />}
      secondAddon={showAddon && <Pill className="size-4" />}
      onChange={onChange}
      onValueChange={onValueChange}
      placeholder={placeholder}
      options={data}
      onSearch={setSearch}
      getOptionKey={(medicine) => medicine.id}
      getOptionLabel={getOptionLabel}
      renderOption={(medicine) => {
        const TypeIcon = MEDICINE_TYPE_ICONS[medicine.type];

        return (
          <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{medicine.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {[medicine.genericName, medicine.strength]
                  .filter(Boolean)
                  .join(` - `)}
              </span>
            </div>
            <TypeIcon
              aria-hidden
              className="size-3.5 shrink-0 text-muted-foreground"
            />
          </div>
        );
      }}
    />
  );
}
