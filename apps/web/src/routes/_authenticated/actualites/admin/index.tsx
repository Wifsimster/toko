import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Newspaper,
    Eye,
    EyeOff,
    ShieldAlert,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdminNews, useDeleteNews, useIsNewsAdmin } from "@/hooks/use-news";

export const Route = createFileRoute("/_authenticated/actualites/admin/")({
    component: AdminNewsList,
});

function formatDate(dateStr: string | null, locale: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AdminNewsList() {
    const { t, i18n } = useTranslation();
    const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
    const { data: adminCheck, isLoading: checkingAdmin } = useIsNewsAdmin();
    const { data: articles, isLoading } = useAdminNews();
    const deleteNews = useDeleteNews();

    if (checkingAdmin) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!adminCheck?.isAdmin) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-destructive/60" />
                <p className="text-lg font-medium text-muted-foreground">
                    {t("newsAdmin.noAccess")}
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const sorted = articles ?? [];

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Newspaper className="h-6 w-6 text-primary" />
                    <h1 className="font-heading text-2xl font-semibold tracking-tight">
                        {t("newsAdmin.title")}
                    </h1>
                    <Badge variant="outline" className="text-xs">
                        {sorted.length} {t("newsAdmin.articles")}
                    </Badge>
                </div>
                <Link to="/actualites/admin/new">
                    <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        {t("newsAdmin.newArticle")}
                    </Button>
                </Link>
            </div>

            {sorted.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Newspaper className="mb-4 h-12 w-12 text-muted-foreground/40" />
                        <p className="text-lg font-medium text-muted-foreground">
                            {t("newsAdmin.empty")}
                        </p>
                        <Link to="/actualites/admin/new" className="mt-4">
                            <Button size="sm" className="gap-1">
                                <Plus className="h-4 w-4" />
                                {t("newsAdmin.newArticle")}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {sorted.map((article) => (
                        <Card key={article.id} className="transition-colors hover:border-primary/20">
                            <CardContent className="flex items-center justify-between gap-4 py-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {article.published ? (
                                            <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs gap-1">
                                                <Eye className="h-3 w-3" />
                                                {t("newsAdmin.published")}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 border-amber-600/30 text-xs gap-1">
                                                <EyeOff className="h-3 w-3" />
                                                {t("newsAdmin.draft")}
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(article.publishedAt ?? article.createdAt, locale)}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium leading-tight truncate">
                                        {article.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        /{article.slug}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Link to="/actualites/admin/$id" params={{ id: article.id }}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                    <AlertDialog>
                                        <AlertDialogTrigger>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {t("newsAdmin.deleteConfirmTitle")}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t("newsAdmin.deleteConfirmDesc", { title: article.title })}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    {t("newsAdmin.cancel")}
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteNews.mutate(article.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    {t("newsAdmin.confirmDelete")}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
