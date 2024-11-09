/** @license GPL-3.0-or-later
 *
 * Copyright (C) 2024 8 Hobbies, LLC
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {
  defaultUrlPrefixes,
  saveChangesButtonLabel,
  urlPrefixesTextAreaLabel,
} from "./ui_constants";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./OptionsApp";
import { urlPrefixesKey } from "./settings";
import { userEvent } from "@testing-library/user-event";

function getUrlPrefixesTextAreaElement(): HTMLTextAreaElement {
  return screen.getByRole("textbox", { name: urlPrefixesTextAreaLabel });
}

function getSaveChangesButtonElement(): HTMLButtonElement {
  return screen.getByRole("button", { name: saveChangesButtonLabel });
}

describe("Options page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetBrowserStorage();
  });

  test("Initial screen", () => {
    const { unmount } = render(<App />);

    expect(getUrlPrefixesTextAreaElement()).toHaveValue(defaultUrlPrefixes);
    expect(getSaveChangesButtonElement()).toBeEnabled();

    // Explicitly unmount here, otherwise will be warned:
    //   Warning: An update to App inside a test was not wrapped in act(...).
    // See https://github.com/testing-library/react-testing-library/issues/999.
    unmount();
  });

  describe("URL Prefixes text area loads previous save", () => {
    for (const testCase of [
      {
        name: "single line",
        input: "https://a.example.com",
        expected: "https://a.example.com",
      },
      {
        name: "multi lines",
        input: "https://a.example.com\nhttps://b.example.com",
        expected: "https://a.example.com\nhttps://b.example.com",
      },
      {
        name: "with a Blank line",
        input: "https://a.example.com\n  \nhttps://b.example.com",
        expected: "https://a.example.com\nhttps://b.example.com",
      },
      {
        name: "with no protocol",
        input: "a.example.com\nhttps://b.example.com",
        expected: "https://a.example.com\nhttps://b.example.com",
      },
      {
        name: "with http protocol",
        input: "http://a.example.com\nhttps://b.example.com",
        expected: "http://a.example.com\nhttps://b.example.com",
      },
      {
        name: "with spaces around valid lines",
        input: "  http://a.example.com\nhttps://b.example.com   ",
        expected: "http://a.example.com\nhttps://b.example.com",
      },
    ] as const) {
      test(testCase.name, async () => {
        const user = userEvent.setup();
        const { unmount } = render(<App />);

        await waitFor(() => {
          expect(getUrlPrefixesTextAreaElement()).toBeEnabled();
        });
        await user.clear(getUrlPrefixesTextAreaElement());
        await user.type(getUrlPrefixesTextAreaElement(), testCase.input);
        await user.click(getSaveChangesButtonElement());
        unmount();

        // Reload the page, the saved URL prefixes should be there.
        render(<App />);
        await waitFor(() => {
          expect(getUrlPrefixesTextAreaElement()).toBeEnabled();
          expect(getUrlPrefixesTextAreaElement()).toHaveValue(
            testCase.expected,
          );
        });
      });
    }
  });

  test("Loading with erroneous storage", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    await chrome.storage.sync.set({ [urlPrefixesKey]: "not a string array" });

    const { unmount } = render(<App />);
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("Unexpected url prefixes type"),
      );
    });
    expect(getUrlPrefixesTextAreaElement()).toBeEnabled();
    expect(getUrlPrefixesTextAreaElement()).toHaveValue(defaultUrlPrefixes);

    // Explicitly unmount here, otherwise will be warned:
    //   Warning: An update to App inside a test was not wrapped in act(...).
    // See https://github.com/testing-library/react-testing-library/issues/999.
    unmount();
  });

  describe("Show error when one line is not a URL", () => {
    for (const testCase of [
      ["Plainly not a URL", "AN INVALID URL"],
      ["URL with a param", "https://example.com?abc=1"],
    ] as const) {
      test(testCase[0], async () => {
        const invalidUrl = testCase[1];
        const user = userEvent.setup();
        render(<App />);

        await waitFor(() => {
          expect(getUrlPrefixesTextAreaElement()).toBeEnabled();
        });
        await user.clear(getUrlPrefixesTextAreaElement());
        await user.type(
          getUrlPrefixesTextAreaElement(),
          `https://example.com/subsite\n${invalidUrl}\nhttps://example.org`,
        );
        expect(getUrlPrefixesTextAreaElement()).toBeValid(); // Sanity check
        await user.click(getSaveChangesButtonElement());

        await waitFor(() => {
          expect(getUrlPrefixesTextAreaElement()).toBeInvalid();
        });
        expect(
          screen.getByText(`"${invalidUrl}" is not a valid URL prefix`, {
            exact: false,
          }),
        ).toBeInTheDocument();
      });
    }
  });
});
