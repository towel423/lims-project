// React Imports
import type { ReactElement } from "react";

// Next Imports
import dynamic from "next/dynamic";

// Component Imports
import AccountSettings from "@/views/user-profile";

const AccountTab = dynamic(() => import("@/views/user-profile/account"));
const SecurityTab = dynamic(() => import("@/views/user-profile/security"));
const BillingPlansTab = dynamic(
  () => import("@/views/user-profile/billing-plans")
);
// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  account: <AccountTab />,
  security: <SecurityTab />,
  "billing-plans": <BillingPlansTab />,
});

const AccountSettingsPage = () => {
  return <AccountSettings tabContentList={tabContentList()} />;
};

export default AccountSettingsPage;
