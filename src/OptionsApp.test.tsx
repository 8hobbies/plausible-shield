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
import { userEvent } from "@testing-library/user-event";

function getUrlPrefixesTextAreaElement(): HTMLTextAreaElement {
  return screen.getByRole("textbox", { name: urlPrefixesTextAreaLabel });
}

function getSaveChangesButtonElement(): HTMLButtonElement {
  return screen.getByRole("button", { name: saveChangesButtonLabel });
}

describe("Options page", () => {
  beforeEach(() => {
    resetBrowserStorage();
  });

  test("Initial screen", () => {
    render(<App />);

    expect(getUrlPrefixesTextAreaElement()).toHaveValue(defaultUrlPrefixes);
    expect(getSaveChangesButtonElement()).toBeEnabled();
  });

  for (const testCase of [
    ["single line", "https://a.example.com"],
    ["multi lines", "https://a.example.com\nhttps://b.example.com"],
  ]) {
    test(`URL Prefixes text area loads previous save: ${testCase[0]}`, async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);

      await user.clear(getUrlPrefixesTextAreaElement());
      await user.type(getUrlPrefixesTextAreaElement(), testCase[1]);
      await user.click(getSaveChangesButtonElement());
      unmount();

      // Reload the page, the saved URL prefixes should be there.
      render(<App />);
      await waitFor(() => {
        expect(getUrlPrefixesTextAreaElement()).toHaveValue(testCase[1]);
      });
    });
  }
});
