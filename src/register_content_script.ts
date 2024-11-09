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

export const contentScriptId = "URLPrefixes" as const;

/** Register content scripts. */
export async function registerContentScripts(
  newUrlPrefixes: readonly string[],
): Promise<void> {
  const matches = newUrlPrefixes.map((prefix) =>
    // If it's a host only, match with /* due to limitations in content script match patterns.
    new URL(prefix).pathname === "/" && prefix.at(-1) !== "/"
      ? `${prefix}/*`
      : `${prefix}*`,
  );

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const curScript = await chrome.scripting.getRegisteredContentScripts({
    ids: [contentScriptId],
  });

  const updateFunc =
    curScript.length === 0
      ? chrome.scripting.registerContentScripts // eslint-disable-line @typescript-eslint/no-deprecated
      : chrome.scripting.updateContentScripts; // eslint-disable-line @typescript-eslint/no-deprecated

  updateFunc([
    {
      allFrames: true,
      persistAcrossSessions: true,
      runAt: "document_start",
      id: contentScriptId,
      js: ["./src/content.js"],
      matches,
    },
  ])
    .then(() => {
      console.log(`Content script ${contentScriptId} registered/update.`);
    })
    .catch((e: unknown) => {
      console.error(e);
    });
}
