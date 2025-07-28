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
  Notion: [
    {
      heading: "New Comment",
      subheading:
        "Triggers when a new comment is created in your Notion workspace.",
    },
    {
      heading: "New Database Item",
      subheading: "Triggers when a new item is created in a database.",
    },
    {
      heading: "Updated Database Item",
      subheading: "Triggers when a new item in a selected database is updated.",
    },
    {
      heading: "Updated page",
      subheading: "Triggers when a Page is updated.",
    },
  ],
  Slack: [
    {
      heading: "New Channel",
      subheading: "Triggers when a new #channel is created.",
    },
    {
      heading: "New File",
      subheading: "Triggers when a new file is uploaded to your workspace.",
    },
    {
      heading: "New Mention",
      subheading:
        "Triggers when a username or highlight word is mentioned in a public #channel.",
    },
  ],
  Gmail: [
    {
      heading: "New Attachment",
      subheading: "Triggers when your receive a new attachment",
    },
    {
      heading: "New Conversation",
      subheading:
        "Triggers when a new email conversations begains in your inbox.",
    },
    {
      heading: "New Email",
      subheading: "Triggers when a new emai appears in the specified mailbox.",
    },
  ],
  "Google Calendar": [
    {
      heading: "New Event",
      subheading: "Triggers when a new event is created.",
    },
  ],
  "You Tube": [
    {
      heading: "New Comment on Video",
      subheading:
        "Triggers when a new comment is posted on a specific YouTube video.",
    },
  ],

  "Google drive": [
    {
      heading: "New File",
      subheading: "Triggers when any new file is added (inside of any folder).",
    },
    {
      heading: "New File in Folder",
      subheading:
        "Triggers when a new file is created within, moved to, or uploaded directly to a specific folder (but not it's subfolders).",
    },
    {
      heading: "New Folder",
      subheading:
        "Triggers when a new folder is added directly to a specific folder (but not it's subfolder).",
    },
    {
      heading: "Updated File",
      subheading:
        "Triggers when a file is updated in a specific folder (but not it's subfolders).",
    },
  ],
};
