import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Save, Send, Loader2 } from "lucide-react";
import type { News } from "@focusflow/validators";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

interface NewsFormProps {
    initialData?: News | null;
    onSubmit: (data: {
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        published: boolean;
    }) => void;
    isPending: boolean;
}

export function NewsForm({ initialData, onSubmit, isPending }: NewsFormProps) {
    const { t } = useTranslation();
    const isEdit = !!initialData;

    const [title, setTitle] = useState(initialData?.title ?? "");
    const [slug, setSlug] = useState(initialData?.slug ?? "");
    const [slugManual, setSlugManual] = useState(isEdit);
    const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
    const [content, setContent] = useState(initialData?.content ?? "");
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (!slugManual && !isEdit) {
            setSlug(slugify(title));
        }
    }, [title, slugManual, isEdit]);

    const handleSubmit = (e: React.FormEvent, publish: boolean) => {
        e.preventDefault();
        onSubmit({ title, slug, excerpt, content, published: publish });
    };

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    return (
        <form className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="news-title">{t("newsAdmin.titleLabel")}</Label>
                <Input
                    id="news-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("newsAdmin.titlePlaceholder")}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="news-slug">{t("newsAdmin.slugLabel")}</Label>
                <div className="flex gap-2">
                    <Input
                        id="news-slug"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setSlugManual(true);
                        }}
                        placeholder="mon-article"
                        required
                        className="font-mono text-sm"
                    />
                    {slugManual && !isEdit && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSlugManual(false);
                                setSlug(slugify(title));
                            }}
                        >
                            {t("newsAdmin.autoSlug")}
                        </Button>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    {t("newsAdmin.slugHint")}: /actualites/{slug || "..."}
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="news-excerpt">{t("newsAdmin.excerptLabel")}</Label>
                <Textarea
                    id="news-excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder={t("newsAdmin.excerptPlaceholder")}
                    rows={2}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    {excerpt.length}/500
                </p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="news-content">{t("newsAdmin.contentLabel")}</Label>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                            {wordCount} {t("newsAdmin.words")} · ~{readTime} min
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="gap-1"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            {showPreview ? t("newsAdmin.edit") : t("newsAdmin.preview")}
                        </Button>
                    </div>
                </div>

                {showPreview ? (
                    <Card>
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-4 text-sm">
                            <PreviewMarkdown content={content} />
                        </CardContent>
                    </Card>
                ) : (
                    <Textarea
                        id="news-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t("newsAdmin.contentPlaceholder")}
                        rows={20}
                        required
                        className="font-mono text-sm"
                    />
                )}
            </div>

            {isEdit && initialData?.published && (
                <Badge variant="outline" className="text-green-600 border-green-600/30">
                    {t("newsAdmin.published")}
                </Badge>
            )}
            {isEdit && !initialData?.published && (
                <Badge variant="outline" className="text-amber-600 border-amber-600/30">
                    {t("newsAdmin.draft")}
                </Badge>
            )}

            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isPending || !title || !slug || !excerpt || !content}
                    onClick={(e) => handleSubmit(e, false)}
                >
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {t("newsAdmin.saveDraft")}
                </Button>
                <Button
                    type="button"
                    disabled={isPending || !title || !slug || !excerpt || !content}
                    onClick={(e) => handleSubmit(e, true)}
                >
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    {t("newsAdmin.publish")}
                </Button>
            </div>
        </form>
    );
}

function PreviewMarkdown({ content }: { content: string }) {
    const paragraphs = content.split(/\n{2,}/);

    return (
        <>
            {paragraphs.map((para, i) => {
                const trimmed = para.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith("### ")) {
                    return <h3 key={i}>{trimmed.slice(4)}</h3>;
                }
                if (trimmed.startsWith("## ")) {
                    return <h2 key={i}>{trimmed.slice(3)}</h2>;
                }

                if (trimmed.match(/^[-*] /m)) {
                    const items = trimmed.split(/\n/).filter((l) => l.match(/^[-*] /));
                    return (
                        <ul key={i}>
                            {items.map((item, j) => (
                                <li key={j}>{item.replace(/^[-*] /, "")}</li>
                            ))}
                        </ul>
                    );
                }

                return <p key={i}>{trimmed}</p>;
            })}
        </>
    );
}
