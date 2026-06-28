/** @license GPL-3.0-or-later
 *
 * Copyright (C) 2024-2025 8 Hobbies, LLC
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

import { loadUrlPrefixes, urlPrefixesKey } from "./settings";
import { isArrayOf } from "@8hobbies/utils";
import { registerContentScripts } from "./register_content_script";

chrome.storage.onChanged.addListener(async (changes, _) => {
  if (!(urlPrefixesKey in changes)) {
    // Only concerned with changes in URL prefixes.
    return;
  }

  const newUrlPrefixes: unknown = changes[urlPrefixesKey].newValue;

  if (!isArrayOf(newUrlPrefixes, "string")) {
    // Unrecognized URL prefixes.
    return;
  }

  await registerContentScripts(newUrlPrefixes);
});

chrome.runtime.onStartup.addListener(async () => {
  const urlPrefixes = await loadUrlPrefixes();
  if (urlPrefixes !== null) {
    await registerContentScripts(urlPrefixes);
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.tabs.create({
      url: "https://www.goodaddon.com/plausible-shield/",
    });

    // This install may be a synced install. In a synced install, the storage seems to be synced
    // together with the extension itself, and the storage change event does not take place.
    const urlPrefixes = await loadUrlPrefixes();
    if (urlPrefixes !== null) {
      await registerContentScripts(urlPrefixes);
    }
  } else if (details.reason === "update") {
    await chrome.tabs.create({
      url: "https://www.goodaddon.com/plausible-shield/#changelog",
    });
  }
});
