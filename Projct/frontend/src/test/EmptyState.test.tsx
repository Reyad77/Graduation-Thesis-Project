import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/common/EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="Nothing here" description="Try again later" />);
    expect(screen.getByText("Nothing here")).toBeDefined();
    expect(screen.getByText("Try again later")).toBeDefined();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Click me</button>}
      />
    );
    expect(screen.getByText("Click me")).toBeDefined();
  });
});
