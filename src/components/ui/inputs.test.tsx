import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OtpInput } from "./OtpInput";
import { isValidPhone, PhoneInput } from "./PhoneInput";

vi.mock("@/lib/geolocation", () => ({
  fetchIpLocationCached: () => Promise.resolve(null),
}));

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    value,
    onValueChange,
  }: {
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <select aria-label="country" value={value} onChange={(e) => onValueChange(e.target.value)}>
      <option value="IL">IL</option>
      <option value="US">US</option>
      <option value="GB">GB</option>
    </select>
  ),
}));

function ControlledOtp({ initial = "", onChange }: { initial?: string; onChange?: (v: string) => void }) {
  const [value, setValue] = React.useState(initial);
  return (
    <OtpInput
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

function otpBoxes() {
  return screen.getAllByRole("textbox") as HTMLInputElement[];
}

describe("OtpInput", () => {
  it("renders one box per digit", () => {
    render(<ControlledOtp />);
    expect(otpBoxes()).toHaveLength(6);
  });

  it("fills boxes in order and advances focus", () => {
    render(<ControlledOtp />);
    fireEvent.change(otpBoxes()[0], { target: { value: "1" } });
    fireEvent.change(otpBoxes()[1], { target: { value: "2" } });
    expect(otpBoxes().map((box) => box.value).join("")).toBe("12");
    expect(document.activeElement).toBe(otpBoxes()[2]);
  });

  it("keeps the typed digit in the box the user sees when typing past the end", () => {
    const onChange = vi.fn();
    render(<ControlledOtp onChange={onChange} />);

    fireEvent.change(otpBoxes()[3], { target: { value: "5" } });

    expect(onChange).toHaveBeenLastCalledWith("5");
    expect(otpBoxes()[0].value).toBe("5");
    expect(document.activeElement).toBe(otpBoxes()[1]);
  });

  it("clears the previous box on backspace in an empty box", () => {
    render(<ControlledOtp initial="12" />);
    fireEvent.keyDown(otpBoxes()[2], { key: "Backspace" });
    expect(otpBoxes()[1].value).toBe("");
    expect(otpBoxes()[0].value).toBe("1");
  });

  it("pastes a full code, stripping separators", () => {
    const onChange = vi.fn();
    render(<ControlledOtp onChange={onChange} />);
    fireEvent.paste(otpBoxes()[0], { clipboardData: { getData: () => " 123-456 " } });
    expect(onChange).toHaveBeenLastCalledWith("123456");
    expect(document.activeElement).toBe(otpBoxes()[5]);
  });

  it("truncates a pasted code that is too long", () => {
    const onChange = vi.fn();
    render(<ControlledOtp onChange={onChange} />);
    fireEvent.paste(otpBoxes()[0], { clipboardData: { getData: () => "123456789" } });
    expect(onChange).toHaveBeenLastCalledWith("123456");
  });
});

describe("isValidPhone", () => {
  it.each([undefined, "", "+97250", "abc"])("rejects %j", (value) => {
    expect(isValidPhone(value)).toBe(false);
  });

  it.each(["+972501234567", "+12025550123", "+447911123456"])("accepts %j", (value) => {
    expect(isValidPhone(value)).toBe(true);
  });
});

describe("PhoneInput", () => {
  const onValueChange = vi.fn();

  beforeEach(() => {
    onValueChange.mockReset();
  });

  function phoneField() {
    return screen.getByPlaceholderText("Enter your phone number") as HTMLInputElement;
  }

  it("splits an initial E.164 value into country and national number", () => {
    render(<PhoneInput value="+12025550123" onValueChange={onValueChange} />);
    expect((screen.getByLabelText("country") as HTMLSelectElement).value).toBe("US");
    expect(phoneField().value).toBe("2025550123");
  });

  it("emits E.164 using the selected country's calling code", () => {
    render(<PhoneInput defaultCountry="IL" onValueChange={onValueChange} />);
    fireEvent.change(phoneField(), { target: { value: "50-123-4567" } });
    expect(onValueChange).toHaveBeenLastCalledWith("+972501234567");
  });

  it("drops the national trunk prefix that people type out of habit", () => {
    render(<PhoneInput defaultCountry="IL" onValueChange={onValueChange} />);
    fireEvent.change(phoneField(), { target: { value: "050-123-4567" } });
    expect(onValueChange).toHaveBeenLastCalledWith("+972501234567");
  });

  it("drops the UK trunk prefix too", () => {
    render(<PhoneInput defaultCountry="GB" onValueChange={onValueChange} />);
    fireEvent.change(phoneField(), { target: { value: "07911 123456" } });
    expect(onValueChange).toHaveBeenLastCalledWith("+447911123456");
  });

  it("re-emits with the new calling code when the country changes", () => {
    render(<PhoneInput defaultCountry="IL" onValueChange={onValueChange} />);
    fireEvent.change(phoneField(), { target: { value: "2025550123" } });
    fireEvent.change(screen.getByLabelText("country"), { target: { value: "US" } });
    expect(onValueChange).toHaveBeenLastCalledWith("+12025550123");
  });

  it("emits an empty string when the number is cleared", () => {
    render(<PhoneInput defaultCountry="IL" value="+972501234567" onValueChange={onValueChange} />);
    fireEvent.change(phoneField(), { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("formats a valid number on blur", () => {
    render(<PhoneInput defaultCountry="US" onValueChange={onValueChange} />);
    fireEvent.change(phoneField(), { target: { value: "2025550123" } });
    fireEvent.blur(phoneField());
    expect(phoneField().value).toBe("(202) 555-0123");
  });
});
