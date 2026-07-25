import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SkeletonCard, SkeletonList, SkeletonTable } from "@/components/common/Skeleton";

describe("Skeleton", () => {
  it("renders SkeletonCard", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders SkeletonList with correct count", () => {
    const { container } = render(<SkeletonList count={2} />);
    const cards = container.querySelectorAll(".card");
    expect(cards.length).toBe(2);
  });

  it("renders SkeletonTable with rows", () => {
    const { container } = render(<SkeletonTable rows={3} />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });
});
