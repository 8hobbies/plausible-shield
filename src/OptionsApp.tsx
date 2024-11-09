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

import "./options.scss";
import { Button, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import {
  defaultUrlPrefixes,
  saveChangesButtonLabel,
  urlPrefixesTextAreaLabel,
} from "./ui_constants";
import { loadUrlPrefixes, saveUrlPrefixes } from "./settings";
import { isURL } from "validator";

export default function App(): React.JSX.Element {
  // Initially disable the URL Prefixes textarea, until settings are read.
  const [urlPrefixesEnabled, setUrlPrefixesEnabled] = React.useState(false);
  const [urlPrefixesHelperText, setUrlPrefixesHelperText] = React.useState<
    string | null
  >(null);
  const [urlPrefixes, setUrlPrefixes] =
    React.useState<string>(defaultUrlPrefixes);
  const [submitted, setSubmitted] = React.useState(true);

  useEffect(() => {
    // Load from storage if the form every time the form is submitted.
    if (!submitted) {
      return;
    }

    setSubmitted(false);

    loadUrlPrefixes()
      .then((prefixes) => {
        if (prefixes !== null) {
          setUrlPrefixes(prefixes.join("\n"));
        }
      })
      .catch((e: unknown) => {
        console.error(e);
      })
      .finally(() => {
        setUrlPrefixesEnabled(true);
      });
  }, [submitted]);

  return (
    <>
      <Typography component="h1" variant="h2">
        Plausible Shield Settings
      </Typography>
      <form
        onSubmit={async (e) => {
          /** Is a given URL valid? */
          function isUrlValid(s: string): boolean {
            return isURL(s, {
              protocols: ["https", "http"],
              require_protocol: true,
              // Don't allow query params due to limitations in content script match pattern
              allow_query_components: false,
            });
          }

          const prefixes = urlPrefixes
            .split(/\r|\n/g)
            .map((prefix) => prefix.trim())
            .filter((prefix) => prefix.length > 0);
          // Check each prefix. If not a URL, refuse to submit the form. This is to prevent abuse --
          // this extension is meant to block one's own websites, not all websites that use
          // Plausible.
          const invalidPrefix = prefixes.find((prefix, idx) => {
            if (isUrlValid(prefix)) {
              return false;
            }
            const withHttps = `https://${prefix}` as const;
            if (isUrlValid(withHttps)) {
              // Prepend the existing prefix with https://
              prefixes[idx] = withHttps;
              return false;
            }
            return true;
          });
          if (invalidPrefix !== undefined) {
            setUrlPrefixesHelperText(
              `"${invalidPrefix}" is not a valid URL prefix. A valid URL prefix must be a valid URL itself.`,
            );
            e.preventDefault();
            return false;
          }

          await saveUrlPrefixes(prefixes);
          setSubmitted(true);
        }}
      >
        <Stack spacing={2}>
          <Typography component="p" variant="h6">
            URLs starting with any of the following lines will be excluded from
            Plausible tracking.
          </Typography>
          <TextField
            id="url-prefix-text-field"
            label={urlPrefixesTextAreaLabel}
            variant="outlined"
            value={urlPrefixes}
            disabled={!urlPrefixesEnabled}
            onChange={(e) => {
              setUrlPrefixes(e.target.value);
            }}
            fullWidth
            multiline
            error={urlPrefixesHelperText !== null}
            helperText={urlPrefixesHelperText}
            sx={{
              ".MuiOutlinedInput-input": {
                resize: "vertical",
              },
            }}
            minRows={7}
          />
          <Button type="submit" variant="contained">
            {saveChangesButtonLabel}
          </Button>
        </Stack>
      </form>
    </>
  );
}
