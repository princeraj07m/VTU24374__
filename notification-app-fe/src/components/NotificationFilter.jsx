import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const OPTIONS = ["All", "Event", "Result", "Placement"];

export default function NotificationFilter({ value, onChange }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Notification type</InputLabel>
      <Select value={value} label="Notification type" onChange={(e) => onChange(e.target.value)}>
        {OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
