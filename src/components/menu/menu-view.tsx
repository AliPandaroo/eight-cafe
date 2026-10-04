"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
import { ChartSpline, Receipt } from "lucide-react";

import { Grid } from "@/components/layout";
import { Logo } from "@/components/logo";
import { CategoryNav } from "@/components/menu/category-nav";
import { IntroProgress } from "@/components/menu/intro-progress";
import { ItemCard } from "@/components/menu/item-card";
import { ItemDetail } from "@/components/menu/item-detail";
import {
  getSelectedItemId,
  subscribeSelectedItemId,
} from "@/components/menu/item-selection";
import { PrefactorTray } from "@/components/menu/prefactor-tray";
import { StaffRoleContext } from "@/components/menu/staff-role";
import { Button } from "@/components/ui/button";
import { canBuildPrefactor, homeForRole, type PublicRole } from "@/lib/auth/roles";
import type { PublicMenu } from "@/lib/menu/public";
import { cn } from "@/utils/classMerge";

type IntroPhase = "loading" | "collapse" | "menu";

const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia(REDUCE_MOTION_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCE_MOTION_QUERY).matches,
    () => false,
  );
}

function preloadImages(urls: string[]) {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new window.Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = url;
        }),
    ),
  );
}

function useSelectedItemId() {
  return useSyncExternalStore(
    subscribeSelectedItemId,
    getSelectedItemId,
    () => null,
  );
}

export function MenuView({
  menu,
  role,
}: {
  menu: PublicMenu;
  role: PublicRole;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const itemId = useSelectedItemId();
  const [phase, setPhase] = useState<IntroPhase>("loading");
  const [introComplete, setIntroComplete] = useState(false);
  const progress = useMotionValue(0);

  if (!introComplete && (prefersReducedMotion || itemId || phase === "menu")) {
    setIntroComplete(true);
  }

  const skipIntro = introComplete;
  const activePhase = skipIntro ? "menu" : phase;

  const visibleCategories = menu.categories.filter(
    (category) => category.items.length > 0,
  );
  const selectedItem = itemId
    ? visibleCategories
        .flatMap((category) => category.items)
        .find((item) => item.id === itemId)
    : undefined;
  const isIntro = activePhase === "loading" || activePhase === "collapse";

  useEffect(() => {
    if (skipIntro) {
      return;
    }

    const urls = visibleCategories.flatMap((category) =>
      category.items
        .map((item) => item.imageUrl)
        .filter((url): url is string => Boolean(url)),
    );

    let cancelled = false;
    let collapseTimer: number | undefined;
    let reachedFill = false;

    animate(progress, 92, {
      duration: 2.1,
      ease: [0.22, 1, 0.36, 1],
    });

    const fillReady = new Promise<void>((resolve) => {
      let unsubscribe = () => {};

      const finish = () => {
        if (reachedFill) {
          return;
        }

        reachedFill = true;
        unsubscribe();
        resolve();
      };

      unsubscribe = progress.on("change", (value) => {
        if (value >= 91) {
          finish();
        }
      });

      window.setTimeout(finish, 2300);
    });

    void Promise.all([fillReady, preloadImages(urls)]).then(async () => {
      if (cancelled) {
        return;
      }

      await new Promise<void>((resolve) => {
        animate(progress, 100, {
          duration: 0.32,
          ease: "easeOut",
          onComplete: () => resolve(),
        });
        window.setTimeout(() => resolve(), 400);
      });

      if (cancelled) {
        return;
      }

      setPhase("collapse");
      collapseTimer = window.setTimeout(() => {
        if (!cancelled) {
          setPhase("menu");
        }
      }, 820);
    });

    return () => {
      cancelled = true;
      progress.stop();
      if (collapseTimer !== undefined) {
        window.clearTimeout(collapseTimer);
      }
    };
    // Intro plays once when the menu first mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipIntro]);

  useEffect(() => {
    if (!isIntro) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isIntro]);

  return (
    <StaffRoleContext.Provider value={role}>
      <MotionConfig reducedMotion="never">
        <div className="mx-auto min-h-full w-full">
          <motion.header
            className="flex flex-col overflow-hidden bg-background"
            initial={false}
            animate={{ height: activePhase === "loading" ? "100dvh" : "auto" }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="flex min-h-0 flex-1 flex-col items-center justify-center px-6"
              initial={false}
              animate={{
                paddingTop: activePhase === "loading" ? 24 : 20,
                paddingBottom: activePhase === "loading" ? 24 : 16,
                gap: activePhase === "loading" ? 16 : 10,
              }}
              transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={false}
                animate={{ scale: activePhase === "loading" ? 1 : 0.42 }}
                transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
              >
                <Logo size="large" />
              </motion.div>
              <motion.h1
                className="font-brand origin-center text-center text-[18px] font-normal text-text"
                initial={false}
                animate={{
                  scale: activePhase === "loading" ? 1 : 0.92,
                }}
                transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
              >
                {menu.restaurant.name}
              </motion.h1>
            </motion.div>

            <AnimatePresence>
              {activePhase === "loading" ? (
                <motion.div
                  key="intro-progress"
                  className="shrink-0"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeIn" }}
                >
                  <IntroProgress progress={progress} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.header>

          {activePhase === "menu" ? (
            <>
              <CategoryNav
                reveal={!skipIntro}
                categories={visibleCategories.map((category) => ({
                  id: category.id,
                  slug: category.slug,
                  name: category.name,
                }))}
              />

              {visibleCategories.length === 0 ? (
                <p className="px-4 py-16 text-center text-[13px] text-text/65 md:px-8">
                  منو هنوز آماده نیست.
                </p>
              ) : (
                <div
                  className={
                    canBuildPrefactor(role)
                      ? "px-4 pb-36 md:px-8"
                      : "px-4 pb-16 md:px-8"
                  }
                >
                  {visibleCategories.map((category, categoryIndex) => (
                    <section
                      key={category.id}
                      id={category.slug}
                      className="scroll-mt-24 border-b border-foreground/15 py-4 last:border-b-0 md:py-10 max-w-xl md:max-w-5xl mx-auto"
                    >
                      <h2 className="mb-2 text-[13px] text-text/55 md:mb-6">
                        {category.name}
                      </h2>
                      <Grid cols={2} gap={3} className="md:gap-8">
                        {category.items.map((item, itemIndex) => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            priority={categoryIndex === 0 && itemIndex < 4}
                          />
                        ))}
                      </Grid>
                    </section>
                  ))}
                </div>
              )}

              <footer className="flex flex-col items-center gap-2 px-4 pb-8 text-center text-[11px] text-text-disabled">
                {role === "waiter" ? (
                  <Image src="/static/wine.png" alt="گارسون" width={76} height={76} />
                ) : role === "manager" ? (
                  <Image src="/static/manager.png" alt="مدیر" width={76} height={76} />
                ) : (
                  <Image src="/static/menu.png" alt="منو" width={76} height={76} />
                )}
                <Logo size="mini" color="#ffffff" />
              </footer>
            </>
          ) : null}

          <AnimatePresence>
            {selectedItem ? (
              <ItemDetail key={selectedItem.id} item={selectedItem} />
            ) : null}
          </AnimatePresence>
          {canBuildPrefactor(role) && activePhase === "menu" ? (
            <PrefactorTray />
          ) : null}
          {role !== "customer" && activePhase === "menu" ? (
            <Button
              asChild
              variant="circle"
              className={cn(
                "fixed bottom-5 z-50 size-14 rounded-full p-0 right-4 shadow-2xl",
                role === "waiter" ? "" : "",
              )}
            >
              <Link
                href={homeForRole(role)}
                aria-label={role === "waiter" ? "پیش‌فاکتورها" : "پنل"}
              >
                {role === "waiter" ? (
                  <Receipt className="size-9 text-background" />
                ) : (
                  <ChartSpline className="size-9 text-background" />
                )}
              </Link>
            </Button>
          ) : null}
        </div>
      </MotionConfig>
    </StaffRoleContext.Provider>
  );
}
