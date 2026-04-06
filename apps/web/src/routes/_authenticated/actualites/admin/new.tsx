import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { NewsForm } from "@/components/news/news-form";
import { useCreateNews } from "@/hooks/use-news";

export const Route = createFileRoute("/_authenticated/actualites/admin/new")({
    component: AdminNewsNew,
});

function AdminNewsNew() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const createNews = useCreateNews();

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
                {t("newsAdmin.createTitle")}
            </h1>

            <NewsForm
                isPending={createNews.isPending}
                onSubmit={(data) => {
                    createNews.mutate(data, {
                        onSuccess: () => navigate({ to: "/actualites/admin" }),
                    });
                }}
            />
        </div>
    );
}
