"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, Users } from "lucide-react";
import { toast } from "sonner";
import {
  getKitaplikAdminUserDetailAction,
  listKitaplikAdminUsersAction,
} from "@/lib/actions/kitaplik-admin-users";
import type {
  KitaplikAdminUserDetail,
  KitaplikAdminUserSummary,
} from "@/lib/kitaplik/admin-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface KitaplikAdminUsersPanelProps {
  initialUsers: KitaplikAdminUserSummary[];
}

export function KitaplikAdminUsersPanel({
  initialUsers,
}: KitaplikAdminUsersPanelProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "with" | "without">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<KitaplikAdminUserDetail | null>(null);
  const [isRefreshing, startRefresh] = useTransition();
  const [isLoadingDetail, startDetail] = useTransition();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (filter === "with" && !user.hasPurchases) return false;
      if (filter === "without" && user.hasPurchases) return false;
      if (!q) return true;
      return (
        user.email.toLowerCase().includes(q) ||
        (user.fullName?.toLowerCase().includes(q) ?? false) ||
        (user.phone?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [users, query, filter]);

  function refresh() {
    startRefresh(async () => {
      const result = await listKitaplikAdminUsersAction();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setUsers(result.users);
      toast.success("Kullanici listesi yenilendi.");
    });
  }

  function toggleUser(userId: string) {
    if (expandedId === userId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(userId);
    setDetail(null);
    startDetail(async () => {
      const result = await getKitaplikAdminUserDetailAction(userId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setDetail(result.user);
    });
  }

  const withBooks = users.filter((u) => u.hasPurchases).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary-950">
            <Users className="h-5 w-5 text-accent-600" aria-hidden />
            Kullanicilar
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} kayitli kullanici · {withBooks} kisinin e-kitap hakki
            var
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={refresh}
        >
          Yenile
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="E-posta, ad veya telefon ara…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Tumu"],
              ["with", "Kitap alanlar"],
              ["without", "Almayanlar"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-primary-100 bg-white">
        <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.6fr] gap-3 border-b border-primary-100 bg-primary-50/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700 md:grid">
          <span>E-posta / ad</span>
          <span>Kayit</span>
          <span>Kitap</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Eslesen kullanici yok.
          </p>
        ) : (
          <ul className="divide-y divide-primary-100">
            {filtered.map((user) => {
              const open = expandedId === user.userId;
              const showingDetail =
                open && detail?.userId === user.userId ? detail : null;

              return (
                <li key={user.userId}>
                  <button
                    type="button"
                    onClick={() => toggleUser(user.userId)}
                    className="grid w-full grid-cols-1 gap-2 px-4 py-3 text-left transition hover:bg-primary-50/50 md:grid-cols-[1.4fr_1fr_0.7fr_0.6fr] md:items-center md:gap-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-primary-950">
                        {user.email}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {user.fullName || "Ad yok"}
                        {user.phone ? ` · ${user.phone}` : ""}
                      </span>
                    </span>
                    <span className="text-sm text-primary-800">
                      {formatDate(user.registeredAt)}
                    </span>
                    <span>
                      {user.hasPurchases ? (
                        <Badge variant="outline">
                          {user.bookCount} kitap
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Yok</Badge>
                      )}
                    </span>
                    <span className="flex justify-end text-primary-700">
                      {open ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {open ? (
                    <div className="border-t border-primary-50 bg-primary-50/40 px-4 py-4">
                      {isLoadingDetail && !showingDetail ? (
                        <p className="text-sm text-muted-foreground">
                          Detay yukleniyor…
                        </p>
                      ) : showingDetail ? (
                        <div className="space-y-4">
                          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                E-posta
                              </dt>
                              <dd className="font-medium text-primary-950">
                                {showingDetail.email}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                Ad
                              </dt>
                              <dd className="font-medium text-primary-950">
                                {showingDetail.fullName || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                Telefon
                              </dt>
                              <dd className="font-medium text-primary-950">
                                {showingDetail.phone || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                Kayit
                              </dt>
                              <dd className="font-medium text-primary-950">
                                {formatDate(showingDetail.registeredAt)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                Son giris
                              </dt>
                              <dd className="font-medium text-primary-950">
                                {formatDate(showingDetail.lastSignInAt)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                E-posta dogrulama
                              </dt>
                              <dd className="font-medium text-primary-950">
                                {formatDate(showingDetail.emailConfirmedAt)}
                              </dd>
                            </div>
                          </dl>

                          <div>
                            <h3 className="mb-2 text-sm font-semibold text-primary-950">
                              E-kitap haklari ({showingDetail.books.length})
                            </h3>
                            {showingDetail.books.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                Bu kullanicinin e-kitap hakki yok.
                              </p>
                            ) : (
                              <ul className="space-y-2">
                                {showingDetail.books.map((book) => (
                                  <li
                                    key={book.entitlementId}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary-100 bg-white px-3 py-2 text-sm"
                                  >
                                    <div>
                                      {book.slug ? (
                                        <Link
                                          href={`/kitap/${book.slug}`}
                                          className="font-medium text-primary-950 underline-offset-2 hover:underline"
                                        >
                                          {book.title}
                                        </Link>
                                      ) : (
                                        <span className="font-medium text-primary-950">
                                          {book.title}
                                        </span>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        Verilis: {formatDate(book.grantedAt)}
                                        {book.wcOrderId
                                          ? ` · Siparis #${book.wcOrderId}`
                                          : ""}
                                      </p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Detay yuklenemedi.
                        </p>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
