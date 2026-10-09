import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationDialog } from "./ConfirmationDialog";

describe("ConfirmationDialog Component", () => {
  it("renders when open and triggers onConfirm", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        confirmText="Delete"
        status="danger"
      />
    );

    expect(screen.getByRole("heading", { name: /Delete Item/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this item\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when isPending is true", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Sending Document"
        confirmText="Send"
        isPending={true}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /Send/i });
    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });

    expect(confirmBtn).toBeDisabled();
    expect(cancelBtn).toBeDisabled();
  });
});
