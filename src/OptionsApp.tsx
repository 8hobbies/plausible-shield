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

export default function App(): React.JSX.Element {
  const [urlPrefixes, setUrlPrefixes] =
    React.useState<string>(defaultUrlPrefixes);
  const [submitted, setSubmitted] = React.useState(true);

  useEffect(() => {
    // Load from storage if the form every time the form is submitted.
    if (!submitted) {
      return;
    }

    setSubmitted(false);

    loadUrlPrefixes().then(
      (prefixes) => {
        setUrlPrefixes(prefixes.join("\n"));
      },
      (e: unknown) => {
        console.error(e);
      },
    );
  }, [submitted]);

  return (
    <>
      <Typography component="h1" variant="h2">
        Plausible Shield Settings
      </Typography>
      <form
        onSubmit={async () => {
          await saveUrlPrefixes(urlPrefixes);
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
            onChange={(e) => {
              setUrlPrefixes(e.target.value);
            }}
            fullWidth
            multiline
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
