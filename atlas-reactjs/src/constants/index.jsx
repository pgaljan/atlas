import React from "react";
import Icons from "./icons";

export const teamMembersConfig = {
  title: "Team Members",
  tabs: [
    { key: "users", label: "Users" },
    { key: "pending", label: "Pending Invitations" },
  ],
  enableSearch: true,
  enableCheckbox: false,
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "userType", label: "User Type" },
    {
      key: "lastAccess",
      label: "Last Access",
      icon: [<Icons.IIcon className="w-5 h-5" color="#000000" />],
    },
    { key: "status", label: "Status" },
    {
      key: "joinDate",
      label: "Join Date",
      icon: <Icons.IIcon className="w-5 h-5" color="#000000" />,
    },
  ],
  data: [
    {
      id: 1,
      name: "Devis",
      email: "devis@gmail.com",
      userType: "Workspace admin",
      lastAccess: "in a few seconds",
      status: "Active",
      joinDate: "12/23/2024",
      Avatar: "https://via.placeholder.com/40",
    },
  ],
  actions: [
    {
      icon: <Icons.EditIcon className="w-5 h-5" color="#000000" />,
      tooltip: "Edit",
    },
    {
      icon: <Icons.TrashIcon className="w-5 h-5" color="#660000" />,
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
export const trashConfig = {
  title: "Trash",
  tabs: [],
  enableSearch: false,
  columns: [
    { key: "name", label: "Structure Name" },
    { key: "deletedBy", label: "Deleted by " },
    { key: "deletedAt", label: "Deleted at " },
  ],
  data: [
    {
      id: 1,
      name: "Structure",
      deletedBy: "Devis",
      deletedAt: "15:00",
    },
  ],
  actions: [
    {
      icon: <Icons.EditIcon className="w-5 h-5" color="#000000" />,
      tooltip: "Edit",
    },
    {
      icon: <Icons.TrashIcon className="w-5 h-5" color="#660000" />,
      tooltip: "Delete",
    },
  ],
};
export const mediaConfig = {
  title: "Media",
  tabs: [],
  enableSearch: false,
  columns: [
    { key: "mediaFile", label: "Media file" },
    { key: "uploadedBy", label: "Uploaded by " },
    { key: "uploadedAt", label: "Uploaded at " },
  ],
  data: [
    {
      id: 1,
      mediaFile: "File",
      uploadedBy: "Devis",
      uploadedAt: "15:00",
    },
  ],
  actions: [
    {
      icon: <Icons.ViewFileIcon className="w-5 h-5" color="#000000" />,
      tooltip: "View",
    },
    {
      icon: <Icons.EditIcon className="w-5 h-5" color="#000000" />,
      tooltip: "Edit",
    },
    {
      icon: <Icons.TrashIcon className="w-5 h-5" color="#660000" />,
      tooltip: "Delete",
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

export const backupConfig = {
  title: "My Backups",
  tabs: [],
  enableSearch: false,
  columns: [
    { key: "backupFile", label: "Backup file" },
    { key: "downloadLink", label: "Download link " },
    { key: "createDate", label: "Create date" },
  ],
  data: [
    {
      id: 1,
      backupFile: "File",
      downloadLink: "www.atlas.com",
      createDate: "12/23/2024",
    },
  ],
  actions: [
    {
      icon: <Icons.TrashIcon className="w-5 h-5" color="#660000" />,
      tooltip: "Delete",
    },
  ],
};

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
