import { PageHeader } from "@/components/ui/page-header";
import { DepositCalendar } from "@/components/ui/deposit-calendar";
import { WELCOME_MESSAGES } from "./welcome-messages";

function getWelcomeMessage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return WELCOME_MESSAGES[dayOfYear % WELCOME_MESSAGES.length]!;
}

export function OverviewPageHeader() {
  const { title, message } = getWelcomeMessage();

  return (
    <PageHeader
      title={title}
      subtitle={message}
      actions={<DepositCalendar />}
    />
  );
}
