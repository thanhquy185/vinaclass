/* Return the uppercase first character of the final name part. */
export const getFirstCharOfLastName = (name: string): string => {
  if (!name) return "U"; // Use a neutral fallback for empty names.

  // Trim repeated whitespace and split the name into parts.
  const words = name.trim().split(/\s+/);

  // Select the final name part.
  const lastName = words[words.length - 1];

  // Return its first character in uppercase.
  return lastName.charAt(0).toUpperCase();
};

/** Create a default avatar URL from a name. */
export const getDefaultAvatar = (name: string): string => {
  const displayChar = getFirstCharOfLastName(name);

  // Pass the normalized initial to the avatar service.
  return `https://ui-avatars.com/api/?name=${displayChar}&background=random`;
};

export const getRandomBackground = (): string => {
  // Add a random query value to avoid a cached background.
  const seed = Math.floor(Math.random() * 10000);
  const baseUrl = `https://picsum.photos/400/200`;

  return `${baseUrl}?blur=7&random=${seed}`;
};
