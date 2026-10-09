import React from "react";
import {
  Modal,
  Form,
  Surface,
  Select,
  ListBox,
  Label,
  Description,
  ComboBox,
  Input,
  Spinner,
  TextField,
  FieldError,
  Button,
  Chip,
} from "@heroui/react";
import { ComboBoxStateContext } from "react-aria-components";
import { Search, Plus, Trash2, Receipt, AlertCircle } from "lucide-react";
import { Invoice, EnquiryWithDetails, InvoiceType } from "../../../../types/database";
import { Product } from "../../../../types";
import { CustomerSearchResult } from "../../../../services/invoiceService";
import { InvoiceFormData } from "../../types";
import { INVOICE_TYPE_OPTIONS, GST_RATE_OPTIONS } from "../../constants";

const ComboBoxSearchInput: React.FC<React.ComponentProps<typeof Input>> = (props) => {
  const state = React.useContext(ComboBoxStateContext);
  return (
    <Input
      {...props}
      onClick={(e) => {
        state?.open(null, "manual");
        props.onClick?.(e);
      }}
    />
  );
};

interface InvoiceFormModalProps {
  isOpen: boolean;
  editingInvoice: Invoice | null;
  invoiceForm: InvoiceFormData;
  setInvoiceForm: React.Dispatch<React.SetStateAction<InvoiceFormData>>;
  enquiries: EnquiryWithDetails[];
  productCatalog: Product[];
  customerSearchQuery: string;
  customerSuggestions: CustomerSearchResult[];
  isSearchingCustomers: boolean;
  handleCustomerSearch: (val: string) => void;
  handleSelectCustomer: (c: CustomerSearchResult) => void;
  isSubmitting: boolean;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  editingInvoice,
  invoiceForm,
  setInvoiceForm,
  enquiries,
  productCatalog,
  customerSearchQuery,
  customerSuggestions,
  isSearchingCustomers,
  handleCustomerSearch,
  handleSelectCustomer,
  isSubmitting,
  errorMsg,
  setErrorMsg,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      isDismissable={false}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      data-react-aria-top-layer="true"
    >
      <Modal.Container placement="center" size="lg">
        <Modal.Dialog data-react-aria-top-layer="true">
          <Modal.CloseTrigger onPress={onClose} aria-label="Close modal" />
          <Modal.Header>
            <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
              {editingInvoice
                ? `Edit ${editingInvoice.type === "quotation" ? "Quotation" : "Tax Invoice"} (${editingInvoice.invoice_number})`
                : "Create Formal Quotation / Tax Invoice"}
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body>
            {errorMsg && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Form
              id="create-invoice-form"
              validationBehavior="native"
              onSubmit={onSubmit}
              className="space-y-4"
            >
              <Surface
                className="flex min-w-[320px] flex-col gap-4 rounded-3xl p-6"
                variant="secondary"
              >
                {/* Document Type */}
                <Select
                  fullWidth
                  value={invoiceForm.type}
                  onChange={(val) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      type: (val as InvoiceType) || "quotation",
                    }))
                  }
                  aria-label="Document Type"
                >
                  <Label>Document Type</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {INVOICE_TYPE_OPTIONS.map((t) => (
                        <ListBox.Item
                          key={t.id}
                          id={t.id}
                          textValue={t.label}
                        >
                          {t.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                {/* Link to Inquiry */}
                <Select
                  fullWidth
                  value={invoiceForm.enquiryId}
                  onChange={(val) => {
                    const selectedId = (val as string) || "";
                    const matched = enquiries.find((en) => en.id === selectedId);
                    if (matched) {
                      setInvoiceForm((prev) => ({
                        ...prev,
                        enquiryId: selectedId,
                        customerName: matched.name,
                        customerCompany: matched.company || "",
                        customerEmail: matched.email,
                        customerPhone: matched.phone || "",
                      }));
                    } else {
                      setInvoiceForm((prev) => ({
                        ...prev,
                        enquiryId: selectedId,
                      }));
                    }
                  }}
                  aria-label="Link to Inquiry"
                  placeholder="-- Standalone (No Inquiry) --"
                >
                  <Label>Link to Inquiry</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="" textValue="-- Standalone (No Inquiry) --">
                        <span className="text-muted italic">-- Standalone (No Inquiry) --</span>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {enquiries.map((e) => (
                        <ListBox.Item
                          key={e.id}
                          id={e.id}
                          textValue={`${e.name} (${e.company || "Client"})`}
                        >
                          <div className="flex flex-col">
                            <Label>{e.name}</Label>
                            <Description>{e.company || e.email}</Description>
                          </div>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                {/* Customer Auto-fill / Search ComboBox */}
                <ComboBox
                  fullWidth
                  allowsCustomValue
                  allowsEmptyCollection
                  menuTrigger="focus"
                  inputValue={customerSearchQuery}
                  onInputChange={handleCustomerSearch}
                  onSelectionChange={(key) => {
                    if (key) {
                      const pool: CustomerSearchResult[] =
                        customerSuggestions.length > 0
                          ? customerSuggestions
                          : enquiries.map(
                              (e): CustomerSearchResult => ({
                                id: e.id,
                                name: e.name,
                                company: e.company || null,
                                email: e.email,
                                phone: e.phone || null,
                                address: null,
                                gst: null,
                                source: "enquiry",
                              }),
                            );
                      const selected = pool.find(
                        (c, i) =>
                          (c.id ||
                            `${c.source}-${c.email || c.name}-${i}`) === key,
                      );
                      if (selected) {
                        handleSelectCustomer(selected);
                      }
                    }
                  }}
                  aria-label="Search Customer Database (Auto-fill)"
                >
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5 font-semibold">
                      <Search className="w-3.5 h-3.5 text-primary" />
                      <span>Search Customer Database (Auto-fill)</span>
                    </Label>
                    {(invoiceForm.customerName || invoiceForm.customerEmail) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onPress={() => {
                          setInvoiceForm((prev) => ({
                            ...prev,
                            enquiryId: "",
                            customerName: "",
                            customerCompany: "",
                            customerEmail: "",
                            customerPhone: "",
                            customerAddress: "",
                            customerGst: "",
                          }));
                          handleCustomerSearch("");
                        }}
                      >
                        + New Customer (Clear)
                      </Button>
                    )}
                  </div>

                  <ComboBox.InputGroup>
                    <ComboBoxSearchInput placeholder="Type name, company, or email to search past records..." />
                    <ComboBox.Trigger aria-label="Show customer suggestions">
                      {isSearchingCustomers ? <Spinner size="sm" /> : undefined}
                    </ComboBox.Trigger>
                  </ComboBox.InputGroup>

                  <ComboBox.Popover>
                    <ListBox
                      renderEmptyState={() => (
                        <div className="p-3 text-center text-xs">
                          {isSearchingCustomers ? (
                            <div className="flex items-center justify-center gap-2 py-1 text-muted">
                              <Spinner size="sm" />
                              <span>Searching database...</span>
                            </div>
                          ) : customerSearchQuery.trim().length >= 2 ? (
                            <>
                              <p className="font-medium text-foreground">
                                No matching customer found
                              </p>
                              <p className="text-xs text-muted">
                                You can enter customer details manually in the fields below.
                              </p>
                            </>
                          ) : (
                            <p className="text-muted">
                              Type at least 2 characters to search past records...
                            </p>
                          )}
                        </div>
                      )}
                    >
                      {(customerSuggestions.length > 0
                        ? customerSuggestions
                        : enquiries.slice(0, 8).map(
                            (e): CustomerSearchResult => ({
                              id: e.id,
                              name: e.name,
                              company: e.company || null,
                              email: e.email,
                              phone: e.phone || null,
                              address: null,
                              gst: null,
                              source: "enquiry",
                            }),
                          )
                      ).map((c, i) => {
                        const itemKey =
                          c.id || `${c.source}-${c.email || c.name}-${i}`;
                        const searchText =
                          `${c.name} ${c.company || ""} ${c.email} ${c.phone || ""}`.trim();
                        return (
                          <ListBox.Item
                            key={itemKey}
                            id={itemKey}
                            textValue={searchText}
                          >
                            <div className="flex items-center justify-between gap-2 w-full">
                              <div className="flex flex-col min-w-0">
                                <Label className="font-medium">
                                  {c.name} {c.company ? `(${c.company})` : ""}
                                </Label>
                                <Description className="truncate">
                                  {c.email}
                                  {c.phone ? ` • ${c.phone}` : ""}
                                </Description>
                                {c.address && (
                                  <Description className="text-xs text-muted truncate">
                                    {c.address}
                                  </Description>
                                )}
                              </div>
                              <Chip
                                size="sm"
                                variant="soft"
                                color={
                                  c.source === "invoice" ? "accent" : "default"
                                }
                                className="shrink-0"
                              >
                                {c.source === "invoice"
                                  ? "Past Client"
                                  : "Inquiry Lead"}
                              </Chip>
                            </div>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        );
                      })}
                    </ListBox>
                  </ComboBox.Popover>
                </ComboBox>

                {/* Customer Name */}
                <TextField
                  isRequired
                  fullWidth
                  name="customerName"
                  value={invoiceForm.customerName}
                  onChange={(val) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      customerName: val,
                    }))
                  }
                  validate={(value) => {
                    if (!value || !value.trim()) {
                      return "Customer Name is required";
                    }
                    return null;
                  }}
                >
                  <Label>Customer Name</Label>
                  <Input placeholder="e.g. Acme Corporation or Contact Person" />
                  <FieldError />
                </TextField>

                {/* Company / Organization */}
                <TextField
                  fullWidth
                  name="customerCompany"
                  value={invoiceForm.customerCompany}
                  onChange={(val) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      customerCompany: val,
                    }))
                  }
                >
                  <Label>Company / Organization</Label>
                  <Input placeholder="e.g. Precision Components Ltd" />
                  <FieldError />
                </TextField>

                {/* Customer Email */}
                <TextField
                  isRequired
                  fullWidth
                  name="customerEmail"
                  type="email"
                  value={invoiceForm.customerEmail}
                  onChange={(val) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      customerEmail: val,
                    }))
                  }
                  validate={(value) => {
                    if (!value || !value.trim()) {
                      return "Customer Email is required";
                    }
                    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value.trim())) {
                      return "Please enter a valid email address";
                    }
                    return null;
                  }}
                >
                  <Label>Customer Email</Label>
                  <Input placeholder="e.g. contact@company.com" />
                  <FieldError />
                </TextField>

                {/* Customer Phone */}
                <TextField
                  fullWidth
                  name="customerPhone"
                  type="tel"
                  value={invoiceForm.customerPhone}
                  onChange={(val) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      customerPhone: val,
                    }))
                  }
                  validate={(value) => {
                    if (value && value.trim() && !/^[+0-9\s-]{7,15}$/.test(value.trim())) {
                      return "Please enter a valid phone number";
                    }
                    return null;
                  }}
                >
                  <Label>Customer Phone</Label>
                  <Input placeholder="e.g. +91 98765 43210" />
                  <FieldError />
                </TextField>

                {/* Billing Address */}
                <TextField
                  fullWidth
                  name="customerAddress"
                  value={invoiceForm.customerAddress}
                  onChange={(val) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      customerAddress: val,
                    }))
                  }
                >
                  <Label>Billing Address</Label>
                  <Input placeholder="Plot No, Industrial Estate, City..." />
                  <FieldError />
                </TextField>

                {/* GSTIN Number */}
                <TextField
                  fullWidth
                  name="customerGst"
                  value={invoiceForm.customerGst}
                  onChange={(val) =>
                    setInvoiceForm((prev) => ({
                      ...prev,
                      customerGst: val.toUpperCase(),
                    }))
                  }
                  validate={(value) => {
                    if (
                      value &&
                      value.trim() &&
                      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(value.trim())
                    ) {
                      return "Invalid GSTIN format (e.g. 33AAAAA0000A1Z5)";
                    }
                    return null;
                  }}
                >
                  <Label>GSTIN Number</Label>
                  <Input placeholder="e.g. 33AAAAA0000A1Z5" />
                  <FieldError />
                </TextField>

                {/* Line Items Section Header */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Label className="font-semibold text-foreground">
                    Line Items
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onPress={() =>
                      setInvoiceForm((prev) => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          {
                            description: "",
                            quantity: 1,
                            unitPrice: 0,
                            taxRate: 18,
                          },
                        ],
                      }))
                    }
                    className="gap-1 text-primary"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </Button>
                </div>

                {/* Line Items Loop */}
                {invoiceForm.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface border border-border rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Item #{idx + 1}
                      </span>
                      {invoiceForm.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          onPress={() => {
                            const newItems = invoiceForm.items.filter(
                              (_, i) => i !== idx,
                            );
                            setInvoiceForm((prev) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                          aria-label="Remove item"
                          className="text-danger hover:text-danger-hover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    <Select
                      fullWidth
                      value={item.productId || ""}
                      onChange={(val) => {
                        const pId = (val as string) || "";
                        if (pId) {
                          const isAlreadySelected = invoiceForm.items.some(
                            (other, oIdx) =>
                              oIdx !== idx && other.productId === pId,
                          );
                          if (isAlreadySelected) {
                            setErrorMsg(
                              "This catalogue product has already been selected on this invoice. Duplicate selection is not permitted; please adjust the quantity instead.",
                            );
                            return;
                          }
                        }
                        const p = productCatalog.find((prod) => prod.id === pId);
                        const newItems = [...invoiceForm.items];
                        if (p) {
                          newItems[idx] = {
                            ...newItems[idx],
                            productId: p.id,
                            description: `${p.title}${p.tagline ? " - " + p.tagline : ""}`,
                            taxRate: 18,
                          };
                        } else {
                          newItems[idx] = {
                            ...newItems[idx],
                            productId: undefined,
                          };
                        }
                        setInvoiceForm((prev) => ({
                          ...prev,
                          items: newItems,
                        }));
                      }}
                      placeholder="-- Custom / Service Line Item --"
                      aria-label="Select Product from Catalogue"
                    >
                      <Label>Product from Catalogue</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item
                            id=""
                            textValue="-- Custom / Service Line Item --"
                          >
                            <span className="text-muted italic">
                              -- Custom / Service Line Item --
                            </span>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          {productCatalog.map((prod) => {
                            const isSelectedElsewhere = invoiceForm.items.some(
                              (other, oIdx) =>
                                oIdx !== idx && other.productId === prod.id,
                            );
                            return (
                              <ListBox.Item
                                key={prod.id}
                                id={prod.id}
                                isDisabled={isSelectedElsewhere}
                                textValue={`${prod.title} (${prod.category})${isSelectedElsewhere ? " (Already Selected)" : ""}`}
                                className={
                                  isSelectedElsewhere
                                    ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 pointer-events-none"
                                    : ""
                                }
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center justify-between gap-2">
                                    <Label
                                      className={
                                        isSelectedElsewhere
                                          ? "text-slate-400 line-through"
                                          : ""
                                      }
                                    >
                                      {prod.title}
                                    </Label>
                                    {isSelectedElsewhere && (
                                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                        Already Selected
                                      </span>
                                    )}
                                  </div>
                                  <Description>{prod.category}</Description>
                                </div>
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            );
                          })}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    <TextField
                      isRequired
                      fullWidth
                      name={`item-description-${idx}`}
                      value={item.description}
                      onChange={(val) => {
                        const newItems = [...invoiceForm.items];
                        newItems[idx] = {
                          ...newItems[idx],
                          description: val,
                        };
                        setInvoiceForm((prev) => ({
                          ...prev,
                          items: newItems,
                        }));
                      }}
                      validate={(value) => {
                        if (!value || !value.trim()) {
                          return "Item description is required";
                        }
                        return null;
                      }}
                    >
                      <Label>Item Description / Specifications</Label>
                      <Input placeholder="e.g. Air Electronic Column Gauge Model AEC-100" />
                      <FieldError />
                    </TextField>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <TextField
                        isRequired
                        fullWidth
                        name={`item-qty-${idx}`}
                        value={String(item.quantity)}
                        onChange={(val) => {
                          const newItems = [...invoiceForm.items];
                          newItems[idx] = {
                            ...newItems[idx],
                            quantity: parseInt(val, 10) || 1,
                          };
                          setInvoiceForm((prev) => ({
                            ...prev,
                            items: newItems,
                          }));
                        }}
                        validate={(value) => {
                          const q = parseInt(value, 10);
                          if (isNaN(q) || q < 1) {
                            return "Min 1";
                          }
                          return null;
                        }}
                      >
                        <Label>Quantity</Label>
                        <Input type="number" min="1" />
                        <FieldError />
                      </TextField>

                      <TextField
                        isRequired
                        fullWidth
                        name={`item-price-${idx}`}
                        value={String(item.unitPrice)}
                        onChange={(val) => {
                          const newItems = [...invoiceForm.items];
                          newItems[idx] = {
                            ...newItems[idx],
                            unitPrice: parseFloat(val) || 0,
                          };
                          setInvoiceForm((prev) => ({
                            ...prev,
                            items: newItems,
                          }));
                        }}
                        validate={(value) => {
                          const p = parseFloat(value);
                          if (isNaN(p) || p < 0) {
                            return "Must be >= 0";
                          }
                          return null;
                        }}
                      >
                        <Label>Unit Price (₹)</Label>
                        <Input type="number" min="0" step="0.01" />
                        <FieldError />
                      </TextField>

                      <Select
                        fullWidth
                        value={String(item.taxRate)}
                        onChange={(val) => {
                          const newItems = [...invoiceForm.items];
                          newItems[idx] = {
                            ...newItems[idx],
                            taxRate: parseFloat(val as string) || 0,
                          };
                          setInvoiceForm((prev) => ({
                            ...prev,
                            items: newItems,
                          }));
                        }}
                        aria-label="GST Rate"
                      >
                        <Label>GST Rate (%)</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {GST_RATE_OPTIONS.map((rate) => (
                              <ListBox.Item
                                key={rate.id}
                                id={rate.id}
                                textValue={rate.label}
                              >
                                {rate.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>
                ))}

                {/* Live Total Calculation */}
                {(() => {
                  let subtotal = 0;
                  let tax = 0;
                  invoiceForm.items.forEach((it) => {
                    const line = it.quantity * it.unitPrice;
                    subtotal += line;
                    tax += (line * it.taxRate) / 100;
                  });
                  const grandTotal = subtotal + tax;

                  return (
                    <div className="bg-primary-soft/30 p-3 rounded-xl border border-primary/20 flex justify-between items-center font-mono">
                      <div>
                        <span className="text-xs text-muted block">
                          Subtotal: ₹{subtotal.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-muted block">
                          GST: ₹{tax.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-primary uppercase font-bold block">
                          Grand Total
                        </span>
                        <span className="text-base font-bold text-foreground">
                          ₹{grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </Surface>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onPress={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-invoice-form"
              variant="primary"
              size="sm"
              isDisabled={isSubmitting}
              className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <Spinner size="sm" color="current" />
              ) : (
                <Receipt className="w-3.5 h-3.5" />
              )}
              {editingInvoice ? "Save Changes" : "Generate Document"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
