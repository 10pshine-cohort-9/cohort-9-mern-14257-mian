import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Notes App heading successfully", () => {
  render(<App />);
  const headingElement = screen.getByText(/Notes App/i);
  expect(headingElement).toBeInTheDocument();
});
