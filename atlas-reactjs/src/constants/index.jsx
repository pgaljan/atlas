import React from "react";
import { BsDatabaseFillCheck } from "react-icons/bs";
import { FaSlideshare } from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import { IoTrash } from "react-icons/io5";
import { MdOutlineRestore, MdPermMedia } from "react-icons/md";
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
    { key: "name", label: "Full Name" },
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
  title: "Invited Members",
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
      icon: <IoTrash className="w-6 h-6" color="red" />,
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
    description: "all your backups will appear here.",
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
