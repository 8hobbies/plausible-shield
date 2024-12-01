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

import { isArrayOf } from "@8hobbies/utils";

export const urlPrefixesKey = "urlPrefixes" as const;

/** Save URLs to storage. */
export async function saveUrlPrefixes(
  urlPrefixes: readonly string[],
): Promise<void> {
  await chrome.storage.sync.set({ [urlPrefixesKey]: urlPrefixes });
}

/** Load URLs from storage. */
export async function loadUrlPrefixes(): Promise<string[] | null> {
  const urlPrefixes = await chrome.storage.sync.get(urlPrefixesKey);
  if (!(urlPrefixesKey in urlPrefixes)) {
    // No settings yet.
    return null;
  }
  const prefixes: unknown = urlPrefixes[urlPrefixesKey];
  if (!isArrayOf(prefixes, "string")) {
    console.error(
      `Unexpected url prefixes type ${JSON.stringify(urlPrefixes)}`,
    );
    return null;
  }
  return prefixes;
}
