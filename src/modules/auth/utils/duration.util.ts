const DURATION_PATTERN = /^(\d+)([smhd])$/;

export function durationToSeconds(value: string) {
  const match = value.match(DURATION_PATTERN);

  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported duration unit: ${unit}`);
  }
}

export function addDuration(date: Date, value: string) {
  return new Date(date.getTime() + durationToSeconds(value) * 1000);
}
