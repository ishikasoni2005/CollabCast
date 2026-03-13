export const buildInvitePath = (inviteCode) => `/invite/${inviteCode}`;

export const buildInviteUrl = (inviteCode) => {
  if (typeof window === 'undefined') {
    return buildInvitePath(inviteCode);
  }

  return new URL(buildInvitePath(inviteCode), window.location.origin).toString();
};

export const parseInviteCode = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const normalizedUrl = trimmedValue.startsWith('http')
      ? trimmedValue
      : `https://placeholder.invalid${trimmedValue.startsWith('/') ? '' : '/'}${trimmedValue}`;
    const parsedUrl = new URL(normalizedUrl);
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const inviteIndex = segments.findIndex((segment) => segment === 'invite');

    if (inviteIndex >= 0 && segments[inviteIndex + 1]) {
      return segments[inviteIndex + 1];
    }
  } catch {
    return /^[a-zA-Z0-9_-]+$/.test(trimmedValue) ? trimmedValue : null;
  }

  return /^[a-zA-Z0-9_-]+$/.test(trimmedValue) ? trimmedValue : null;
};

export const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', 'true');
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
};

export const copyInviteLink = (inviteCode) => copyText(buildInviteUrl(inviteCode));
