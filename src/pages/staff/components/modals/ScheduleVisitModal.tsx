import React from "react";
import {
  Modal,
  Surface,
  TextField,
  Label,
  Input,
  Select,
  ListBox,
  DatePicker,
  DateField,
  Calendar,
  TimeField,
  TextArea,
  Button,
  Spinner,
} from "@heroui/react";
import { AlertCircle, MapPin } from "lucide-react";
import { DateValue, getLocalTimeZone } from "@internationalized/date";
import { EnquiryWithDetails, VisitPurpose } from "../../../../types/database";
import { VisitFormData } from "../../types";
import { VISIT_PURPOSE_OPTIONS } from "../../constants";

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  enquiries: EnquiryWithDetails[];
  visitForm: VisitFormData;
  setVisitForm: React.Dispatch<React.SetStateAction<VisitFormData>>;
  visitDateValue: DateValue | null;
  setVisitDateValue: (val: DateValue | null) => void;
  isSubmitting: boolean;
  error: string | null;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  enquiries,
  visitForm,
  setVisitForm,
  visitDateValue,
  setVisitDateValue,
  isSubmitting,
  error,
}) => {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      isDismissable={false}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Container placement="center" size="lg">
        <Modal.Dialog>
          <Modal.CloseTrigger onPress={onClose} aria-label="Close modal" />
          <Modal.Header>
            <Modal.Heading>Schedule Client Site Visit</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="p-0 overflow-visible">
            {error && (
              <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              id="create-visit-form"
              onSubmit={onSubmit}
              className="space-y-3.5 text-xs"
            >
              <Surface
                className="flex min-w-[320px] flex-col gap-4 rounded-3xl p-6"
                variant="secondary"
              >
                <TextField>
                  <Label>
                    Select Client Inquiry{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={visitForm.enquiryId}
                    onChange={(val) =>
                      setVisitForm({
                        ...visitForm,
                        enquiryId: (val as string) || "",
                      })
                    }
                    className="w-full"
                    aria-label="Select Client Inquiry"
                    placeholder="-- Choose Client --"
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox className="outline-none space-y-0.5">
                        {enquiries.map((e) => (
                          <ListBox.Item
                            key={e.id}
                            id={e.id}
                            textValue={`${e.name} ${e.company ? `(${e.company})` : ""} - ${e.specific_product || e.product_category || "Inquiry"}`}
                          >
                            {e.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </TextField>

                <TextField>
                  <Label>Visit Title</Label>
                  <Input
                    type="text"
                    value={visitForm.title}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, title: e.target.value })
                    }
                    placeholder="e.g. On-site Calibration & Dimension Verification"
                  />
                </TextField>

                <TextField>
                  <Label>Purpose</Label>
                  <Select
                    value={visitForm.visitPurpose}
                    onChange={(val) =>
                      setVisitForm({
                        ...visitForm,
                        visitPurpose: (val as VisitPurpose) || "consultation",
                      })
                    }
                    className="w-full"
                    aria-label="Visit Purpose"
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox className="outline-none space-y-0.5">
                        {VISIT_PURPOSE_OPTIONS.map((item) => (
                          <ListBox.Item
                            key={item.id}
                            id={item.id}
                            textValue={item.label}
                          >
                            {item.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </TextField>

                <TextField>
                  <Label>Contact Person</Label>
                  <Input
                    type="text"
                    value={visitForm.customerContactPerson}
                    onChange={(e) =>
                      setVisitForm({
                        ...visitForm,
                        customerContactPerson: e.target.value,
                      })
                    }
                    placeholder="e.g. Quality Manager"
                  />
                </TextField>

                <DatePicker
                  isRequired
                  granularity="minute"
                  hourCycle={12}
                  hideTimeZone={true}
                  value={visitDateValue}
                  onChange={(val) => {
                    setVisitDateValue(val);
                    if (val) {
                      try {
                        const tz = getLocalTimeZone();
                        const iso =
                          "toDate" in val &&
                          typeof (val as any).toDate === "function"
                            ? (val as any).toDate(tz).toISOString()
                            : new Date(val.toString()).toISOString();
                        setVisitForm((prev) => ({
                          ...prev,
                          scheduledAt: iso,
                        }));
                      } catch {
                        setVisitForm((prev) => ({
                          ...prev,
                          scheduledAt: val.toString(),
                        }));
                      }
                    } else {
                      setVisitForm((prev) => ({
                        ...prev,
                        scheduledAt: "",
                      }));
                    }
                  }}
                  className="w-full"
                  aria-label="Scheduled Date & Time"
                >
                  {({ state }) => (
                    <>
                      <Label>Scheduled Date & Time</Label>
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
                        <Calendar aria-label="Visit Date">
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
                              {(day) => (
                                <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                              )}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                              {(date) => <Calendar.Cell date={date} />}
                            </Calendar.GridBody>
                          </Calendar.Grid>
                          <Calendar.YearPickerGrid>
                            <Calendar.YearPickerGridBody>
                              {({ year }) => (
                                <Calendar.YearPickerCell year={year} />
                              )}
                            </Calendar.YearPickerGridBody>
                          </Calendar.YearPickerGrid>
                        </Calendar>
                        <div className="flex items-center justify-between">
                          <Label>Time</Label>
                          <TimeField
                            aria-label="Visit Time"
                            granularity="minute"
                            hourCycle={12}
                            hideTimeZone={true}
                            value={state.timeValue}
                            onChange={(v) => {
                              if (v) state.setTimeValue(v);
                            }}
                          >
                            <TimeField.Group variant="secondary">
                              <TimeField.Input>
                                {(segment) => (
                                  <TimeField.Segment segment={segment} />
                                )}
                              </TimeField.Input>
                            </TimeField.Group>
                          </TimeField>
                        </div>
                      </DatePicker.Popover>
                    </>
                  )}
                </DatePicker>

                <TextField>
                  <Label>Visit Agenda / Notes</Label>
                  <TextArea
                    rows={2}
                    value={visitForm.notes}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, notes: e.target.value })
                    }
                    placeholder="Inspect workpiece fixture, verify air line pressure..."
                  />
                </TextField>
              </Surface>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline" size="sm" onPress={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-visit-form"
              variant="primary"
              size="sm"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner size="sm" color="current" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
              Confirm Visit
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
