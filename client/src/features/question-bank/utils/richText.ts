export const stripParagraphTags = (html: string) => {
  return html.replace(/<\/?p>/g, "");
};
