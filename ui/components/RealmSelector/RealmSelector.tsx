import { Select } from "@base-ui/react/select";
import { useRealm } from "@/lib/realm";
import { useMemo, useCallback } from "react";
import "./RealmSelector.css";

export const RealmSelector = () => {
  const { selectedRealm, availableRealms, setRealm } = useRealm();

  // Create items array for Base UI Select with proper structure
  const items = useMemo(
    () =>
      availableRealms.map((realm) => ({
        label: realm,
        value: realm,
      })),
    [availableRealms],
  );

  const handleValueChange = useCallback(
    (value: string | null) => {
      if (value) {
        setRealm(value);
      }
    },
    [setRealm],
  );

  return (
    <Select.Root items={items} value={selectedRealm} onValueChange={handleValueChange}>
      <Select.Trigger className="realm-selector-trigger">
        <Select.Value placeholder="Select realm" />
        <Select.Icon className="realm-selector-icon">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 1L6 6L11 1" />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="realm-selector-positioner" sideOffset={4}>
          <Select.Popup className="realm-selector-popup">
            <Select.List className="realm-selector-list">
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  value={item.value}
                  className="realm-selector-item"
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator className="realm-selector-indicator">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <path d="M2 6L4.5 8.5L10 3" />
                    </svg>
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
};
