import { TextField, Typography } from "@mui/material";

import "./options.scss";

export default function App() {
  return (
    <>
      <h1>Plausible Shield Settings</h1>
      <Typography component="body" variant="h6">
        URLs starting with any of the following lines will be excluded from
        Plausible tracking.
      </Typography>
      <TextField
        id="outlined-multiline-flexible"
        label="URL Prefixes (One per line)"
        variant="outlined"
        fullWidth
        multiline
        sx={{
          ".MuiOutlinedInput-input": {
            resize: "vertical",
          },
        }}
        minRows={7}
      />
    </>
  );
}
