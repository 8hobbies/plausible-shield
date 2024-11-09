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
import { render, screen } from "@testing-library/react";
import App from "./OptionsApp";

vi.mock("./settings.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./settings.js")>();
  return {
    ...mod,
    loadUrlPrefixes: (): Promise<string[]> => new Promise(() => []),
    saveUrlPrefixes: (_: string): Promise<void> => new Promise(() => undefined),
  };
});

function getUrlPrefixesTextAreaElement(): HTMLTextAreaElement {
  return screen.getByRole("textbox", { name: urlPrefixesTextAreaLabel });
}

function getSaveChangesButtonElement(): HTMLButtonElement {
  return screen.getByRole("button", { name: saveChangesButtonLabel });
}

test("Initial screen", () => {
  render(<App />);

  const urlPrefixesTextArea = getUrlPrefixesTextAreaElement();
  expect(urlPrefixesTextArea).toHaveValue(defaultUrlPrefixes);
  const saveChangesButton = getSaveChangesButtonElement();
  expect(saveChangesButton).toBeEnabled();
});
