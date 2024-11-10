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
import {
  Box,
  Button,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import {
  changesSavedText,
  defaultUrlPrefixes,
  saveChangesButtonLabel,
  urlPrefixesTextAreaLabel,
} from "./ui_constants";
import { loadUrlPrefixes, saveUrlPrefixes } from "./settings";
import { getUrlMatches } from "./register_content_script";
import { isURL } from "validator";

export default function App(): React.JSX.Element {
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<boolean | undefined> {
    e.preventDefault();

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
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    chrome.permissions
      .request({
        origins: getUrlMatches(prefixes),
      })
      .then((granted) => {
        if (granted) {
          console.log("Permission obtained");
        } else {
          console.log("Permission denied");
          window.alert(
            "Failed to obtain permissions. Plausible Shield will not function properly. To re-request permissions, please go to Plausible Shield extension settings and save changes again.",
          );
        }
      })
      .catch((e: unknown) => {
        console.error(e);
      });
    await saveUrlPrefixes(prefixes);
    setSubmitted(true);
    setChangesSavedShown(true);
  }

  // Initially disable the URL Prefixes textarea and button, until settings are read.
  const [urlPrefixesEnabled, setUrlPrefixesEnabled] = React.useState(false);
  const [urlPrefixesHelperText, setUrlPrefixesHelperText] = React.useState<
    string | null
  >(null);
  const [urlPrefixes, setUrlPrefixes] =
    React.useState<string>(defaultUrlPrefixes);
  const [submitted, setSubmitted] = React.useState(true);
  const [changesSavedShown, setChangesSavedShown] = React.useState(false);

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
    <Box>
      <Typography component="h1" variant="h2">
        Plausible Shield Settings
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography component="p" variant="h6">
            URLs starting with any of the following lines will be excluded from
            Plausible tracking.
          </Typography>
          <TextField
            id="url-prefix-text-field"
            label={urlPrefixesTextAreaLabel}
            name={urlPrefixesTextAreaLabel}
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
          <Button
            type="submit"
            variant="contained"
            disabled={!urlPrefixesEnabled}
          >
            {saveChangesButtonLabel}
          </Button>
        </Stack>
      </form>
      <Snackbar
        open={changesSavedShown}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => {
          setChangesSavedShown(false);
        }}
        autoHideDuration={5000}
        message={changesSavedText}
      />
    </Box>
  );
}
