import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Notes App heading successfully", () => {
  render(<App />);
  const headingElement = screen.getByRole("heading", { name: /Notes App/i });
  expect(headingElement).toBeInTheDocument();
});
