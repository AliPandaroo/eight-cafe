export function fieldErrorsFromZod(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[]> {
  const flattened = error.flatten().fieldErrors;
  const fieldErrors: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      fieldErrors[key] = messages;
    }
  }

  return fieldErrors;
}
