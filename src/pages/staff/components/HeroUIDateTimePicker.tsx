import React, { useMemo } from "react";
import {
  Calendar,
  DateField,
  DatePicker,
  Description,
  FieldError,
  Label,
  TimeField,
} from "@heroui/react";
import {
  DateValue,
  getLocalTimeZone,
  parseAbsoluteToLocal,
  parseDate,
  parseDateTime,
} from "@internationalized/date";

/**
 * Safely parse date strings (ISO, datetime-local, date) into internationalized DateValue
 */
export function safeParseDate(
  value?: DateValue | string | null,
  granularity: "day" | "minute" = "minute"
): DateValue | null {
  if (!value) return null;
  if (typeof value !== "string") return value;
  const str = value.trim();
  if (!str) return null;

  try {
    if (granularity === "day") {
      const datePart = str.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return parseDate(datePart);
      }
    }

    if (
      str.includes("Z") ||
      str.includes("+") ||
      (str.includes("T") && str.length > 19)
    ) {
      return parseAbsoluteToLocal(new Date(str).toISOString());
    }

    if (str.includes("T")) {
      const cleaned = str.slice(0, 19);
      return parseDateTime(cleaned.length === 16 ? `${cleaned}:00` : cleaned);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return parseDate(str);
    }

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return parseAbsoluteToLocal(d.toISOString());
    }
  } catch (err) {
    console.warn("Failed to parse date string into DateValue:", str, err);
  }
  return null;
}

/**
 * Converts a DateValue to an ISO string or YYYY-MM-DD
 */
export function dateValueToIso(
  val: DateValue | null,
  granularity: "day" | "minute" = "minute"
): string {
  if (!val) return "";
  try {
    const tz = getLocalTimeZone();
    if ("toDate" in val && typeof (val as any).toDate === "function") {
      const d = (val as any).toDate(tz);
      return granularity === "day"
        ? d.toISOString().slice(0, 10)
        : d.toISOString();
    }
    if (granularity === "day") {
      return val.toString().slice(0, 10);
    }
    const d = new Date(val.toString());
    return !isNaN(d.getTime()) ? d.toISOString() : val.toString();
  } catch {
    return val.toString();
  }
}

export interface HeroUIDateTimePickerProps {
  label?: React.ReactNode;
  ariaLabel?: string;
  value?: DateValue | string | null;
  defaultValue?: DateValue | string | null;
  onChange?: (dateValue: DateValue | null, isoString: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  granularity?: "day" | "minute";
  description?: string;
  errorMessage?: string;
  hourCycle?: 12 | 24;
  className?: string;
  name?: string;
}

/**
 * Reusable HeroUI Date & Time Picker Component
 * Uses native HeroUI v3 DatePicker, DateField, Calendar, and TimeField
 * Fully accessible, composable, responsive, and adheres to HeroUI v3 design system
 */
export const HeroUIDateTimePicker: React.FC<HeroUIDateTimePickerProps> = ({
  label,
  ariaLabel = "Select Date & Time",
  value,
  defaultValue,
  onChange,
  isRequired = false,
  isDisabled = false,
  granularity = "minute",
  description,
  errorMessage,
  hourCycle = 12,
  className = "w-full",
  name,
}) => {
  const parsedValue = useMemo(() => {
    if (value === undefined) return undefined;
    return safeParseDate(value, granularity);
  }, [value, granularity]);

  const parsedDefaultValue = useMemo(() => {
    if (!defaultValue) return undefined;
    return safeParseDate(defaultValue, granularity) || undefined;
  }, [defaultValue, granularity]);

  const handleChange = (newVal: DateValue | null) => {
    if (onChange) {
      const iso = dateValueToIso(newVal, granularity);
      onChange(newVal, iso);
    }
  };

  const stringAriaLabel =
    typeof label === "string" ? label : ariaLabel || "Date & Time";

  return (
    <DatePicker
      name={name}
      isRequired={isRequired}
      isDisabled={isDisabled}
      granularity={granularity}
      hourCycle={granularity === "minute" ? hourCycle : undefined}
      hideTimeZone={true}
      value={parsedValue}
      defaultValue={parsedDefaultValue}
      onChange={handleChange}
      className={className}
      aria-label={stringAriaLabel}
    >
      {({ state }) => (
        <>
          {label && <Label>{label}</Label>}
          <DateField.Group fullWidth>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DatePicker.Popover className="flex flex-col gap-3">
            <Calendar aria-label={stringAriaLabel}>
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>
                  {(date) => <Calendar.Cell date={date} />}
                </Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
            {granularity === "minute" && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-600">
                  Time
                </Label>
                <TimeField
                  aria-label={`${stringAriaLabel} Time`}
                  granularity="minute"
                  hourCycle={hourCycle}
                  hideTimeZone={true}
                  value={state.timeValue}
                  onChange={(v) => {
                    if (v) state.setTimeValue(v);
                  }}
                >
                  <TimeField.Group variant="secondary">
                    <TimeField.Input>
                      {(segment) => <TimeField.Segment segment={segment} />}
                    </TimeField.Input>
                  </TimeField.Group>
                </TimeField>
              </div>
            )}
          </DatePicker.Popover>
          {description && <Description>{description}</Description>}
          {errorMessage ? (
            <div className="text-xs text-rose-500 mt-1">{errorMessage}</div>
          ) : (
            <FieldError />
          )}
        </>
      )}
    </DatePicker>
  );
};
