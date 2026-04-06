import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { NewsForm } from "@/components/news/news-form";
import { useAdminNewsArticle, useUpdateNews } from "@/hooks/use-news";

export const Route = createFileRoute("/_authenticated/actualites/admin/$id")({
    component: AdminNewsEdit,
});

function AdminNewsEdit() {
    const { id } = Route.useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: article, isLoading } = useAdminNewsArticle(id);
    const updateNews = useUpdateNews();

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <p className="text-lg text-muted-foreground">
                    {t("news.notFound")}
                </p>
                <Link
                    to="/actualites/admin"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t("newsAdmin.backToList")}
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <Link
                to="/actualites/admin"
                className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("newsAdmin.backToList")}
            </Link>

            <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">
                {t("newsAdmin.editTitle")}
            </h1>

            <NewsForm
                initialData={article}
                isPending={updateNews.isPending}
                onSubmit={(data) => {
                    updateNews.mutate(
                        { id, ...data },
                        { onSuccess: () => navigate({ to: "/actualites/admin" }) }
                    );
                }}
            />
        </div>
    );
}
