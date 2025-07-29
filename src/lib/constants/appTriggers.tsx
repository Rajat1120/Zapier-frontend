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

  "Google slides": [
    {
      heading: "New Presentations",
      subheading: "Triggers when a new presentation is created",
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

export const appActions: Record<
  string,
  { heading: string; subheading: string }[]
> = {
  "Google sheets": [
    {
      heading: "Clear Spreadsheet Row(s)",
      subheading:
        "Clears the content of the selected row(s) while keeping the row(s) intact in the spreadsheet.",
    },
    {
      heading: "Create Spreadsheet",
      subheading:
        "Creates a new spreadsheet. Choose from a blank spreadsheet, a copy of an existing one, or one with headers.",
    },
  ],
  "Google docs": [
    {
      heading: "Create Document from text",
      subheading:
        "Create a new document from text. Also supports Limited HTML.",
    },
  ],
  Notion: [
    {
      heading: "Create Page",
      subheading: "Creates a Page inside a parent page.",
    },
  ],
  Slack: [
    {
      heading: "Create Channel",
      subheading: "Creates a new channel.",
    },
  ],
  Gmail: [
    {
      heading: "Create Draft",
      subheading: "Create a draft email message.",
    },
  ],
  "Google Calendar": [
    {
      heading: "Delete Event",
      subheading: "Deletes an event",
    },
    {
      heading: "Quick Add Event",
      subheading:
        "Create an event from a piece of text. Google parses the text for data,time and description info.",
    },
  ],
  "You Tube": [
    {
      heading: "Add Video to Playlist",
      subheading: "Add a video to one of your playlists",
    },
    {
      heading: "Update Video",
      subheading: "Post a video to your channel",
    },
  ],
  "Google slides": [
    {
      heading: "Create Presentation From Template",
      subheading:
        "Creates a new presentation based on an existing one and can replace any placeholder variable found in your template presentation, like {{name}}, {{email}}, etc.",
    },
  ],

  "Google drive": [
    {
      heading: "Copy File",
      subheading: "Create a copy of specified file.",
    },
    {
      heading: "Create File From Text",
      subheading: "Create a new file from plain text",
    },
    {
      heading: "Create Folder",
      subheading: "Create a new, empty folder.",
    },
    {
      heading: "Create Shortcut",
      subheading: "Create a shortcut to a file.",
    },
    {
      heading: "Delete File",
      subheading:
        "This action will delete a file in Google drive. you will need to provide the file ID",
    },
  ],
};

export const showConfigureArray = [
  "New Document in folder",
  "New or Updated Spreadsheet Row",
  "New Spreadsheet row",
  "New Worksheet",
  "New File in Folder",
  "New Folder",
  "Updated File",
  "New Comment",
  "New Database Item",
  "Updated Database Item",
  "Updated page",
  "New File",
  "New Mention",
  "New Comment on Video",
  "New Attachment",
  "New Conversation",
  "New Email",
  "Clear Spreadsheet Row(s)",
  "Create Spreadsheet",
  "Delete Event",
  "Quick Add Event",
  "Copy File",
  "Create Document from text",
  "Create File From Text",
  "Create Folder",
  "Create Shortcut",
  "Delete File",
  "Create Page",
];
