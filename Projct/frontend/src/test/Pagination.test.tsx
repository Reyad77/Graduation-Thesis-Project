import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "@/components/common/Pagination";
import { BrowserRouter } from "react-router-dom";

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Pagination", () => {
  it("renders nothing when page 1 and no next page", () => {
    const { container } = renderWithRouter(
      <Pagination page={1} hasNext={false} onPageChange={vi.fn()} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders page number and next button when hasNext", () => {
    renderWithRouter(
      <Pagination page={1} hasNext={true} total={50} onPageChange={vi.fn()} />
    );
    expect(screen.getByText("1")).toBeDefined();
  });

  it("calls onPageChange when next is clicked", () => {
    const fn = vi.fn();
    renderWithRouter(
      <Pagination page={1} hasNext={true} onPageChange={fn} />
    );
    const buttons = screen.getAllByRole("button");
    const nextBtn = buttons[buttons.length - 1]; // last button is next
    fireEvent.click(nextBtn);
    expect(fn).toHaveBeenCalledWith(2);
  });

  it("disables prev button on first page", () => {
    renderWithRouter(
      <Pagination page={1} hasNext={true} onPageChange={vi.fn()} />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });
});
