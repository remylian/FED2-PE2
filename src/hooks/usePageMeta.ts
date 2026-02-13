import { useEffect } from "react";

type PageMeta = {
  title?: string;
  description?: string;
};

function upsertMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }

  tag.content = content;
}

export function usePageMeta({ title, description }: PageMeta) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) upsertMeta("description", description);
  }, [title, description]);
}
