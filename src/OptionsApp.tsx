import { Button, Stack, TextField, Typography } from "@mui/material";
import "./options.scss";
import React, { useEffect } from "react";
import { isArrayOf } from "@8hobbies/utils";

const urlPrefixesKey = "urlPrefixes" as const;

/** Save URLs to storage. */
async function saveUrlPrefixes(content: string): Promise<void> {
  const urlPrefixes = content.split(/\r|\n/g).filter((line) => line.length > 0);
  await chrome.storage.sync.set({ [urlPrefixesKey]: urlPrefixes });
}

/** Load URLs from storage. */
async function loadUrlPrefixes(): Promise<string[]> {
  const urlPrefixes = await chrome.storage.sync.get(urlPrefixesKey);
  const prefixes = urlPrefixes[urlPrefixesKey];
  if (!isArrayOf(prefixes, "string")) {
    console.error(`Unexpected url prefix type ${JSON.stringify(urlPrefixes)}`);
    return [];
  }
  return prefixes;
}

export default function App() {
  const [urlPrefixes, setUrlPrefixes] = React.useState("");
  const [submitted, setSubmitted] = React.useState(true);

  useEffect(() => {
    async function loadData() {
      setUrlPrefixes((await loadUrlPrefixes()).join("\n"));
    }

    if (!submitted) {
      return;
    }

    setSubmitted(false);

    loadData().catch(console.error);
  }, [submitted]);

  return (
    <>
      <Typography component="h1" variant="h2">
        Plausible Shield Settings
      </Typography>
      <form
        onSubmit={async () => {
          await saveUrlPrefixes(urlPrefixes);
        }}
      >
        <Stack spacing={2}>
          <Typography component="body" variant="h6">
            URLs starting with any of the following lines will be excluded from
            Plausible tracking.
          </Typography>
          <TextField
            id="url-prefix-text-field"
            label="URL Prefixes (One per line)"
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
            Save Changes
          </Button>
        </Stack>
      </form>
    </>
  );
}
