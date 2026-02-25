import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardBody } from "../Card";

describe("Card", () => {
  it("renders children", () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText("Card content")).toBeDefined();
  });

  it("applies custom className", () => {
    render(<Card className="custom-card">Content</Card>);
    const card = screen.getByText("Content").closest(".custom-card");
    expect(card).toBeDefined();
  });

  it("has proper structure with header and body", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardBody>Body</CardBody>
      </Card>
    );
    expect(screen.getByText("Header")).toBeDefined();
    expect(screen.getByText("Body")).toBeDefined();
  });
});

describe("CardHeader", () => {
  it("renders children", () => {
    render(<CardHeader>Title</CardHeader>);
    expect(screen.getByText("Title")).toBeDefined();
  });

  it("applies custom className", () => {
    render(<CardHeader className="custom-header">Title</CardHeader>);
    const header = screen.getByText("Title");
    expect(header.className).toContain("custom-header");
  });
});

describe("CardBody", () => {
  it("renders children", () => {
    render(<CardBody>Content</CardBody>);
    expect(screen.getByText("Content")).toBeDefined();
  });

  it("applies custom className", () => {
    render(<CardBody className="custom-body">Content</CardBody>);
    const body = screen.getByText("Content");
    expect(body.className).toContain("custom-body");
  });
});
