export const appTriggers: Record<
  string,
  { heading: string; subheading: string }[]
> = {
  "Google sheets": [
    {
      heading: "New or Updated Spreadsheet Row",
      subheading:
        "Triggers when a new row is added or modified in a spreadsheet.",
    },
    {
      heading: "New Spreadsheet",
      subheading: "Triggers when new spreadsheet is created.",
    },
    {
      heading: "New Worksheet",
      subheading: "Triggers when new worksheet is created in a spreadsheet.",
    },
    {
      heading: "New Spreadsheet row",
      subheading:
        "Triggers when a new row is added to the bottom  of a spreadsheet.",
    },
  ],
  "Google docs": [
    {
      heading: "New Document",
      subheading: "Triggers when a new document is added (inside any folder)",
    },
    {
      heading: "New Document in folder",
      subheading:
        "Triggers when a new document is added to a specific folder (but not it's subfolders)",
    },
  ],
};
