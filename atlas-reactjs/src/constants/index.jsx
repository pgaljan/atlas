import React from "react";
import { BsDatabaseFillCheck } from "react-icons/bs";
import { FaSlideshare } from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import { IoTrash } from "react-icons/io5";
import {
  MdOutlineCopyAll,
  MdOutlineRestore,
  MdPermMedia,
} from "react-icons/md";
import { TbEditCircle, TbTrashOff } from "react-icons/tb";
import Icons from "./icons";

export const teamMembersConfig = {
  title: "Team Members",
  showId: true,
  tabs: [
    { key: "users", label: "Users" },
    { key: "pending", label: "Pending Invitations" },
  ],
  enableSearch: true,
  emptyState: {
    title: "No team members found.",
    description: "please invite team members to display here.",
    icon: <HiUsers className="text-5xl text-custom-main" />,
  },
  enableCheckbox: false,
  columns: [
    { key: "name", label: "Display Name" },
    { key: "email", label: "Email" },
    { key: "userType", label: "Role" },
    { key: "status", label: "Status" },
    { key: "joinDate", label: "Date Joined" },
  ],
  actions: [
    {
      icon: <TbEditCircle className="w-6 h-6" color="#000000" />,
      tooltip: "Edit",
    },
    {
      icon: <IoTrash className="w-6 h-6" color="red" />,
      tooltip: "Delete",
    },
  ],
  buttons: [
    {
      label: "All",
      onClick: () => console.log("All clicked"),
      className: "bg-custom-main text-white",
    },
    {
      label: "Member",
      onClick: () => console.log("Member clicked"),
      className: "bg-custom-navbar-active text-white",
    },
  ],
};

export const invitedMembersConfig = {
  title: "Invitations",
  showId: false,
  tabs: [
    { key: "members", label: "All Invitations" },
    { key: "pending", label: "Pending Invitations" },
  ],
  enableSearch: true,
  emptyState: {
    title: "No Invitations found.",
    description: "Invite members to display here.",
    icon: <FaSlideshare className="text-5xl text-custom-main" />,
  },
  enableCheckbox: false,
  columns: [
    { key: "email", label: "Email" },
    { key: "token", label: "Token" },
    { key: "generated", label: "Generated at" },
    { key: "accepted", label: "Accepted at" },
    { key: "expire", label: "Expires at" },
    { key: "status", label: "Status" },
  ],
  actions: [
    {
      icon: <MdOutlineCopyAll className="w-5 h-5 text-gray-700" />,
      tooltip: "Copy Token",
    },
    {
      icon: <IoTrash className="w-6 h-6 text-red-600" />,
      tooltip: "Delete",
    },
  ],
};

export const trashConfig = {
  title: "Deleted Markmaps",
  showId: true,
  tabs: [],
  enableSearch: false,
  emptyState: {
    title: "No deleted markmaps found.",
    description: "deleted markmaps will appear here.",
    icon: <TbTrashOff className="text-5xl text-custom-main" />,
  },
  columns: [
    { key: "name", label: "Structure Name" },
    { key: "deletedBy", label: "Deleted By" },
    { key: "deletedAt", label: "Deleted At" },
  ],
  actions: [
    {
      icon: <MdOutlineRestore className="w-6 h-6" color="#000000" />,
      tooltip: "Restore",
    },
    {
      icon: <IoTrash className="w-6 h-6" color="red" />,
      tooltip: "Delete",
    },
  ],
};

export const mediaConfig = {
  title: "Uploaded Files",
  showId: true,
  tabs: [],
  enableSearch: false,
  emptyState: {
    title: "No uploaded files found.",
    description: "all your uploaded files will appear here.",
    icon: <MdPermMedia className="text-5xl text-custom-main" />,
  },
  columns: [
    { key: "fileUrl", label: "Media File" },
    { key: "fileType", label: "File Type" },
    { key: "updatedAt", label: "Upload Date" },
  ],
  actions: [
    {
      icon: <TbEditCircle className="w-6 h-6" color="#000000" />,
      tooltip: "Edit",
    },
    {
      icon: <IoTrash className="w-6 h-6" color="red" />,
      tooltip: "Delete",
    },
  ],
};

export const backupConfig = {
  title: "My Backups",
  showId: true,
  tabs: [],
  enableSearch: false,
  emptyState: {
    title: "No backups found.",
    description: "All your backups will appear here.",
    icon: <BsDatabaseFillCheck className="text-5xl text-custom-main" />,
  },
  columns: [
    { key: "title", label: "Title" },
    { key: "fileUrl", label: "Download Link" },
    { key: "updatedAt", label: "Created At" },
  ],
  actions: [
    {
      icon: <IoTrash className="w-6 h-6" color="red" />,
      tooltip: "Delete",
      onClick: (item) => console.log("Delete clicked for:", item),
    },
  ],
};

export const plans = [
  {
    name: "Free",
    price: "Free",
    description: "For individuals who want to get started with mind mapping.",
    features: [
      "Up to 3 mind maps",
      "Unlimited collaborators",
      "Templates",
      "Presentations",
      "Focus mode",
      "MeisterTask integration",
      "Apps for iOS & Android",
    ],
    buttonText: "Get started",
    featureHeading: "Free includes:",
  },
  {
    name: "Personal",
    price: "$6.50",
    description: "For individuals who want more flexibility and customization.",
    features: [
      "Unlimited mind maps",
      "Up to 2 attachments",
      "7-day version history",
      "File exports",
      "Print mind maps",
      "Microsoft Teams integration",
    ],
    buttonText: "Get started",
    featureHeading: "Includes Free, plus:",
  },
  {
    name: "Pro",
    price: "$10.50",
    description:
      "For small teams who want to brainstorm and collaborate together.",
    features: [
      "Unlimited attachments",
      "Unlimited version history",
      "Multiple admins",
      "Google Workspace integration",
      "MS exports",
      "Custom branding",
      "Custom color scheme",
    ],
    buttonText: "Get started",
    icon: <Icons.ProCardIcon className="w-[128px] h-[128px]" />,
    highlight: true,
    featureHeading: "Includes Personal, plus:",
  },
  {
    name: "Business",
    price: "$15.50",
    description:
      "For organizations that need advanced security and quick, dedicated support.",
    features: [
      "Group sharing",
      "Compliance exports and backups",
      "SAML SSO (contact Sales)",
      "Advanced settings",
      "Automated access approval",
      "Dedicated Customer Success Manager",
      "Personalized onboarding",
    ],
    buttonText: "Get started",
    featureHeading: "Includes Pro, plus:",
  },
];

export const services = [
  {
    name: "Google",
    description:
      "Connect your Google account to log in via Google, use your avatar, and easily access Google services.",
    action: "Configure",
    icon: <Icons.GoogleServiceIcon className="w-8 h-8 " />,
  },
  {
    name: "Microsoft",
    description:
      "This app allows you to log in to your MeisterLabs products with your Microsoft account.",
    action: "Connect",
    icon: <Icons.MicrosoftIcon className="w-8 h-18" />,
  },
  {
    name: "Apple",
    description:
      "This app allows you to log in to your MeisterLabs products with your Apple account.",
    action: "Connect",
    icon: <Icons.AppleIcon className="w-8  h-8 " />,
  },
  {
    name: "Biggerplate",
    description:
      "This app allows you to log in to your Meister products with your Biggerplate account.",
    action: "Connect",
    icon: <Icons.BiggerPlateIcon className="w-8 h-8 " />,
  },
];

export const personalDetailConfig = {
  tabs: [
    { label: "General" },
    { label: "Email" },
    { label: "Services & Sessions" },
    { label: "Terms & Policies" },
  ],
  fields: [
    {
      label: "Name",
      name: "name",
      placeholder: "Enter your name",
      value: "Engr Kashan",
    },
    {
      label: "Username",
      name: "username",
      placeholder: "Enter your username",
      value: "",
    },
    {
      label: "Website",
      name: "website",
      placeholder: "Enter your website",
      value: "",
    },
    {
      label: "Description",
      name: "description",
      placeholder: "Enter a description",
      value: "",
    },
  ],
  avatar: {
    image: "/path-to-avatar.jpg",
    label: "My Avatar",
    description: "Your photo should be cool and may use transparency.",
  },
  buttons: [{ label: "Save changes", className: "bg-custom-main text-white" }],
};

export const dummyFaqs = [
  {
    question: "What should I do when my board isn't loading?",
    answer: "Try refreshing the page or checking your internet connection.",
  },
  {
    question:
      "Where can I find my invoices and how can I change some information on them?",
    answer:
      "Invoices are available in your billing section under account settings.",
  },
  {
    question: "Why can't I log in to my account?",
    answer:
      "Ensure your credentials are correct and reset your password if needed.",
  },
  {
    question: "Why do I have unexpected charges?",
    answer: "Review your billing details in the account settings.",
  },
  {
    question:
      "Where can I find my invoices and how can I change some information on them?",
    answer:
      "Invoices are available in your billing section under account settings.",
  },

  {
    question: "What should I do when my board isn't loading?",
    answer: "Try refreshing the page or checking your internet connection.",
  },
  {
    question: "How do I convert members to guests?",
    answer: "Go to team settings and update the member roles.",
  },

  {
    question: "How do I add content to my board?",
    answer:
      "Use the toolbar to add text, images, or sticky notes to your board.",
  },

  {
    question: "Why can’t I log in to my account?",
    answer:
      "Ensure your credentials are correct and reset your password if needed.",
  },
  {
    question: "Why do I have unexpected charges?",
    answer: "Review your billing details in the account settings.",
  },
  {
    question: "How do I add content to my board?",
    answer:
      "Use the toolbar to add text, images, or sticky notes to your board.",
  },
  {
    question: "How do I convert members to guests?",
    answer: "Go to team settings and update the member roles.",
  },
];

export const sampleData = {
  csv: `element,Record Data,Tags
  # Human Language Taxonomy,,
  ## 1. Phylum: Indo-European,,
  ### Family: Indo-European,,
  #### Branch: Germanic,,
  ##### English,hello there,Important,
  ##### German,,
  ##### Dutch,,
  ##### Swedish,,
  #### Branch: Romance,,
  ##### Spanish,,
  ##### French,,
  ##### Italian,,
  ##### Portuguese,,
  #### Branch: Slavic,,
  ##### Russian,,
  ##### Polish,,
  ##### Czech,,
  ##### Bulgarian,,
  #### Branch: Indo-Aryan,,
  ##### Hindi,,
  ##### Bengali,,
  ##### Punjabi,,
  ##### Urdu,,
  ## 2. Phylum: Sino-Tibetan,,
  ### Family: Sino-Tibetan,,
  #### Branch: Sinitic,,
  ##### Mandarin Chinese,,
  ##### Cantonese (Yue),,
  ##### Hakka,,
  ##### Min Nan,,
  #### Branch: Tibeto-Burman,,
  ##### Burmese,,
  ##### Tibetan,,
  ##### Karen,,
  ##### Manipuri (Meitei),,
  ## 3. Phylum: Afro-Asiatic,,
  ### Family: Afro-Asiatic,,
  #### Branch: Semitic,,
  ##### Arabic,,
  ##### Hebrew,,
  ##### Amharic,,
  ##### Tigrinya,,
  #### Branch: Berber,,
  ##### Tamazight,,
  ##### Kabyle,,
  ##### Tachelhit,,
  #### Branch: Cushitic,,
  ##### Somali,,
  ##### Oromo,,
  ##### Afar,,
  #### Branch: Chadic,,
  ##### Hausa,,
  ##### Margi,,
  ##### Bura,,`,

  json: `[
{
  "element": "# Human Language Taxonomy",
  "Record Data": "",
  "Tags": ""
},
{
  "element": "## 1. Phylum: Indo-European",
  "Record Data": "hello world",
  "Tags": "Important, Urgent, Review"
},
{
  "element": "### Family: Indo-European",
  "Record Data": "nice short",
  "Tags": "Important, Urgent, Review"
},
{
  "element": "#### Branch: Germanic",
  "Record Data": "wow",
  "Tags": "Important, Urgent, Review"
},
{
  "element": "##### English",
  "Record Data": "hello there",
  "Tags": "Important, Urgent, Review"
},
{
  "element": "##### German",
  "Record Data": "",
  "Tags": ""
},
{
  "element": "##### Dutch",
  "Record Data": "",
  "Tags": ""
},
{
  "element": "##### Swedish",
  "Record Data": "",
  "Tags": ""
},
{
  "element": "#### Branch: Romance",
  "Record Data": "",
  "Tags": ""
},
{
  "element": "##### Spanish",
  "Record Data": "",
  "Tags": ""
},
{
  "element": "##### French",
  "Record Data": "",
  "Tags": ""
},
{
  "element": "##### Italian",
  "Record Data": "",
  "Tags": ""
},
{
  "element": "##### Portuguese",
  "Record Data": "",
  "Tags": ""
}
]`,

  xlsx: `element\tRecord Data\tTags
# Human Language Taxonomy\t\t
## 1. Phylum: Indo-European\t\t
### Family: Indo-European\t\t
#### Branch: Germanic\t\t
##### English\thello there\tImportant, Urgent, Review
##### German\t\t
##### Dutch\t\t
##### Swedish\t\t
#### Branch: Romance\t\t
##### Spanish\t\t
##### French\t\t
##### Italian\t\t
##### Portuguese\t\t
#### Branch: Slavic\t\t
##### Russian\t\t
##### Polish\t\t
##### Czech\t\t
##### Bulgarian\t\t
#### Branch: Indo-Aryan\t\t
##### Hindi\t\t
##### Bengali\t\t
##### Punjabi\t\t
##### Urdu\t\t
## 2. Phylum: Sino-Tibetan\t\t
### Family: Sino-Tibetan\t\t
#### Branch: Sinitic\t\t
##### Mandarin Chinese\t\t
##### Cantonese (Yue)\t\t
##### Hakka\t\t
##### Min Nan\t\t
#### Branch: Tibeto-Burman\t\t
##### Burmese\t\t
##### Tibetan\t\t
##### Karen\t\t
##### Manipuri (Meitei)\t\t
## 3. Phylum: Afro-Asiatic\t\t
### Family: Afro-Asiatic\t\t
#### Branch: Semitic\t\t
##### Arabic\t\t
##### Hebrew\t\t
##### Amharic\t\t
##### Tigrinya\t\t
#### Branch: Berber\t\t
##### Tamazight\t\t
##### Kabyle\t\t
##### Tachelhit\t\t
#### Branch: Cushitic\t\t
##### Somali\t\t
##### Oromo\t\t
##### Afar\t\t
#### Branch: Chadic\t\t
##### Hausa\t\t
##### Margi\t\t
##### Bura\t\t`,
};

export const quickReferenceMarkdown = `
Markdown Quick Reference
========================

This guide is a very brief overview, with examples, of the syntax that [Markdown] supports. It is itself written in Markdown and you can copy the samples over to the left-hand pane for experimentation. It's shown as *text* and not *rendered HTML*.

[Markdown]: http://daringfireball.net/projects/markdown/

Simple Text Formatting
======================

First thing is first. You can use *stars* or _underscores_ for italics. **Double stars** and __double underscores__ for bold. ***Three together*** for ___both___.

Paragraphs are pretty easy too. Just have a blank line between chunks of text.

> This chunk of text is in a block quote. Its multiple lines will all be
> indented a bit from the rest of the text.
>
> > Multiple levels of block quotes also work.

Sometimes you want to include code, such as when you are explaining how '<h1>' HTML tags work, or maybe you are a programmer and you are discussing 'someMethod()'.

If you want to include code and have new
lines preserved, indent the line with a tab
or at least four spaces:

Extra spaces work here too.
This is also called preformatted text and it is useful for showing examples.
The text will stay as text, so any *markdown* or <u>HTML</u> you add will
not show up formatted. This way you can show markdown examples in a
markdown document.

> You can also use preformatted text with your blockquotes
> as long as you add at least five spaces.

Headings
========

There are a couple of ways to make headings. Using three or more equals signs on a line under a heading makes it into an "h1" style. Three or more hyphens under a line makes it "h2" (slightly smaller). You can also use multiple pound symbols ('#') before and after a heading. Pounds after the title are ignored. Here are some examples:

This is H1
==========

This is H2
----------

# This is H1
## This is H2
### This is H3 with some extra pounds ###
#### You get the idea ####
##### I don't need extra pounds at the end
###### H6 is the max

Links
=====

Let's link to a few sites. First, let's use the bare URL, like <https://www.github.com>. Great for text, but ugly for HTML.
Next is an inline link to [Google](https://www.google.com). A little nicer.
This is a reference-style link to [Wikipedia] [1].
Lastly, here's a pretty link to [Yahoo]. The reference-style and pretty links both automatically use the links defined below, but they could be defined *anywhere* in the markdown and are removed from the HTML. The names are also case insensitive, so you can use [YaHoO] and have it link properly.

[1]: https://www.wikipedia.org
[Yahoo]: https://www.yahoo.com

Title attributes may be added to links by adding text after a link.
This is the [inline link](https://www.bing.com "Bing") with a "Bing" title.
You can also go to [W3C] [2] and maybe visit a [friend].

[2]: https://w3c.org (The W3C puts out specs for web-based things)
[Friend]: https://facebook.com "Facebook!"

Email addresses in plain text are not linked: test@example.com.
Email addresses wrapped in angle brackets are linked: <test@example.com>.
They are also obfuscated so that email harvesting spam robots hopefully won't get them.

Lists
=====

* This is a bulleted list
* Great for shopping lists
- You can also use hyphens
+ Or plus symbols

The above is an "unordered" list. Now, on for a bit of order.

1. Numbered lists are also easy
2. Just start with a number
3738762. However, the actual number doesn't matter when converted to HTML.
1. This will still show up as 4.

You might want a few advanced lists:

- This top-level list is wrapped in paragraph tags
- This generates an extra space between each top-level item.

- You do it by adding a blank line

- This nested list also has blank lines between the list items.

- How to create nested lists
1. Start your regular list
2. Indent nested lists with two spaces
3. Further nesting means you should indent with two more spaces
* This line is indented with four spaces.

- List items can be quite lengthy. You can keep typing and either continue
them on the next line with no indentation.

- Alternately, if that looks ugly, you can also
indent the next line a bit for a prettier look.

- You can put large blocks of text in your list by just indenting with two spaces.

This is formatted the same as code, but you can inspect the HTML
and find that it's just wrapped in a '<p>' tag and *won't* be shown
as preformatted text.

You can keep adding more and more paragraphs to a single
list item by adding the traditional blank line and then keep
on indenting the paragraphs with two spaces.

You really only need to indent the first line,
but that looks ugly.

- Lists support blockquotes

> Just like this example here. By the way, you can
> nest lists inside blockquotes!
> - Fantastic!

- Lists support preformatted text

You just need to indent an additional four spaces.

Even More
=========

Horizontal Rule
---------------

If you need a horizontal rule you just need to put at least three hyphens, asterisks, or underscores on a line by themselves. You can also even put spaces between the characters.

---
****************************
_ _ _ _ _ _ _

Those three all produced horizontal lines. Keep in mind that three hyphens under any text turns that text into a heading, so add a blank like if you use hyphens.

Images
------

Images work exactly like links, but they have exclamation points in front. They work with references and titles too.

![Google Logo](https://www.google.com/images/errors/logo_sm.gif) and ![Happy].

[Happy]: https://wpclipart.com/smiley/happy/simple_colors/smiley_face_simple_green_small.png ("Smiley face")

Inline HTML
-----------

If markdown is too limiting, you can just insert your own <strike>crazy</strike> HTML. Span-level HTML <u>can *still* use markdown</u>. Block level elements must be separated from text by a blank line and must not have any spaces before the opening and closing HTML.

<div style='font-family: "Comic Sans MS", "Comic Sans", cursive;'>
It is a pity, but markdown does **not** work in here for most markdown parsers.
[Marked] handles it pretty well.
</div>

`;

export const mockAPIs = [
  {
    name: "MarkMap Renderer",
    createdAt: "06/27/2025 10:45:00",
    status: "Active",
    format: "REST JSON",
    provider: "ATLAS Platform",
    latency: "350ms",
    uptime: "99.98%",
    category: "Visualization",
    updated: "2 days ago",
    collection: "Mind Mapping",
  },
  {
    name: "Syncfusion Chart Engine",
    createdAt: "06/15/2025 14:10:00",
    status: "Active",
    format: "REST JSON",
    provider: "ATLAS Platform",
    latency: "420ms",
    uptime: "100%",
    category: "Data Visualization",
    updated: "1 week ago",
    collection: "Syncfusion Suite",
  },
  {
    name: "PDF Generator API",
    createdAt: "06/10/2025 09:25:00",
    status: "Active",
    format: "REST JSON",
    provider: "ATLAS Platform",
    latency: "510ms",
    uptime: "99.9%",
    category: "Documents",
    updated: "3 days ago",
    collection: "Syncfusion Suite",
  },
  {
    name: "Atlas Auth API",
    createdAt: "06/01/2025 11:00:00",
    status: "Active",
    format: "REST JSON",
    provider: "ATLAS Platform",
    latency: "290ms",
    uptime: "100%",
    category: "Authentication",
    updated: "1 day ago",
    collection: "Platform Services",
  },
  {
    name: "Mindmap Export Service",
    createdAt: "05/28/2025 16:45:00",
    status: "Active",
    format: "REST JSON",
    provider: "ATLAS Platform",
    latency: "400ms",
    uptime: "99.95%",
    category: "Visualization",
    updated: "5 days ago",
    collection: "Mind Mapping",
  },
];

export const apiCategories = [
  {
    name: "Visualization",
    description: "Render and export mindmaps, charts, and graphs visually.",
  },
  {
    name: "Data Visualization",
    description: "Display tables, grids, charts using Syncfusion components.",
  },
  {
    name: "Authentication",
    description: "Manage users, tokens, and secure endpoints.",
  },
  {
    name: "Documents",
    description: "Create, export, and manipulate PDFs and documents.",
  },
];

export const topCollections = [
  {
    name: "Mind Mapping",
    description: "APIs to render, update, and export MarkMap mindmaps.",
    icon: "🧠",
  },
  {
    name: "Syncfusion Suite",
    description: "Integrate charts, PDF tools, and UI widgets easily.",
    icon: "📊",
  },
  {
    name: "Platform Services",
    description: "Core ATLAS services like auth, usage, and workspace APIs.",
    icon: "🧩",
  },
  {
    name: "Dev Utilities",
    description: "Helper APIs for previews, file conversion, and testing.",
    icon: "🛠️",
  },
];

export const policies = [
  {
    title: "API Key Confidentiality",
    description:
      "Your ATLAS API keys (e.g., for MarkMap or Syncfusion rendering) must be kept confidential. Do not expose them in frontend code or public repositories.",
  },
  {
    title: "Token Expiration & Rotation",
    description:
      "Rotate your tokens regularly and remove unused keys from the API Keys section of your ATLAS workspace dashboard.",
  },
  {
    title: "Role-Based Access Control",
    description:
      "ATLAS supports role-based access across organizations, ensuring users can only perform actions permitted by their role (e.g., Viewer, Editor, Admin).",
  },
  {
    title: "Rate Limiting & Abuse Protection",
    description:
      "ATLAS APIs are protected with rate limits to prevent misuse. Exceeding limits may result in throttling or temporary blocking.",
  },
  {
    title: "Secure Transmission (HTTPS)",
    description:
      "All ATLAS API calls (including mindmap rendering and data sync) are encrypted via HTTPS to ensure secure data transmission.",
  },
  {
    title: "Logging & Auditing",
    description:
      "API usage is logged and auditable via your ATLAS account. For any suspicious access or incident tracking, audit logs can be reviewed on request.",
  },
];

export const api = {
  name: "MarkMap API",
  category: "Visualization",
  provider: "ATLAS Platform",
  latency: "540ms",
  uptime: "99.98%",
  updated: "3 days ago",
  description:
    "The MarkMap API allows developers to convert markdown content into interactive mindmaps. Ideal for note-taking apps, visual documentation, and knowledge sharing.",
  format: "REST JSON",
  version: "v2.1.0",
  status: "Active",
  baseUrl: "https://api.atlas.dev/v1/markmap/render",
  auth: "Bearer Token",
  rateLimit: "1000 requests / day",
  docs: "https://docs.atlas.dev/markmap-api",
  errorFormat: "JSON (RFC 7807)",
  useCases: [
    "Generate real-time mindmaps from markdown",
    "Integrate visual notes into LMS or productivity tools",
    "Create dynamic knowledge-sharing experiences",
  ],
};
