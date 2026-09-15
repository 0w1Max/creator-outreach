export function renderTemplate(template: string, lead: { name?: string | null; email: string; channelName?: string | null; channelUrl?: string | null }) {
  const vars: Record<string, string> = {
    "[Name]": lead.name?.trim() || "there",
    "[Email]": lead.email,
    "[ChannelName]": lead.channelName?.trim() || "",
    "[ChannelUrl]": lead.channelUrl?.trim() || "",
  };

  return Object.entries(vars).reduce((text, [token, value]) => text.replaceAll(token, value), template);
}
