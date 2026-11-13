"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { ConnectionError } from "@/components/common/connection-error";
import { ApiError, getCategories, getMe, getProducts } from "@/lib/api";
import type { Category, Product, User } from "@/lib/api.types";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { MenuSkeleton } from "./menu-skeleton";
import { ProductCard } from "./product-card";

const SEARCH_DEBOUNCE_MS = 250;

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M4.5 21c.6-5 3-7.5 7.5-7.5s6.9 2.5 7.5 7.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 28 24" aria-hidden="true">
      <path d="M2 2h3l2.2 12.2h14.4l2.2-8.7H6" />
      <circle cx="10" cy="20" r="1.5" />
      <circle cx="21" cy="20" r="1.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function MenuPage() {
  const { itemCount } = useCart();
  const [activeCategory, setActiveCategory] = useState("ca-phe");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const menuContentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [accountUser, setAccountUser] = useState<User | null>(null);
  const [accountLoadFailed, setAccountLoadFailed] = useState(false);
  const hasLoadedMenuRef = useRef(false);

  useEffect(() => {
    const token = getAccessToken();
    if (token === null) {
      return;
    }

    const controller = new AbortController();
    async function loadAccount(accessToken: string) {
      try {
        setAccountUser(await getMe(accessToken, controller.signal));
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          clearAccessToken();
          return;
        }

        setAccountLoadFailed(true);
      }
    }

    void loadAccount(token);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const nextCategories = await getCategories(controller.signal);
        if (!controller.signal.aborted) {
          setCategories(nextCategories);
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (!controller.signal.aborted) {
          setHasError(true);
        }
      }
    }

    void loadCategories();
    return () => controller.abort();
  }, [retryCount]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      if (!hasLoadedMenuRef.current) {
        setIsInitialLoading(true);
      } else {
        setIsSearching(true);
      }
      setHasError(false);

      try {
        const nextProducts = await getProducts(
          { search: debouncedSearch, category: selectedCategory },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setProducts(nextProducts);
          hasLoadedMenuRef.current = true;
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setHasError(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsInitialLoading(false);
          setIsSearching(false);
        }
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [debouncedSearch, selectedCategory, retryCount]);

  useEffect(() => {
    const contentElement = menuContentRef.current;
    if (!contentElement) {
      return;
    }

    const sections = Array.from(
      contentElement.querySelectorAll<HTMLElement>(".category-section"),
    );
    if (sections.length === 0) {
      return;
    }

    function updateActiveCategory() {
      const currentContent = menuContentRef.current;
      if (!currentContent) {
        return;
      }

      const activationLine =
        currentContent.getBoundingClientRect().top +
        Math.min(80, currentContent.clientHeight * 0.25);
      let activeSection = sections[0];

      for (const section of sections) {
        if (section.getBoundingClientRect().top > activationLine) {
          break;
        }
        activeSection = section;
      }

      if (
        currentContent.scrollTop + currentContent.clientHeight >=
        currentContent.scrollHeight - 2
      ) {
        activeSection = sections[sections.length - 1];
      }

      const slug = activeSection.id.replace("category-", "");
      setActiveCategory((current) => (current === slug ? current : slug));
    }

    contentElement.addEventListener("scroll", updateActiveCategory, { passive: true });
    window.addEventListener("resize", updateActiveCategory);
    updateActiveCategory();

    return () => {
      contentElement.removeEventListener("scroll", updateActiveCategory);
      window.removeEventListener("resize", updateActiveCategory);
    };
  }, [categories, products]);

  const hasActiveFilter = debouncedSearch.length > 0 || selectedCategory !== "all";

  function clearFilters() {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory("all");
    searchInputRef.current?.focus();
  }

  if (isInitialLoading) {
    return <MenuSkeleton />;
  }

  if (hasError) {
    return (
      <ConnectionError
        onRetry={() => {
          hasLoadedMenuRef.current = false;
          setRetryCount((count) => count + 1);
        }}
        onHome={() => {
          setSearchQuery("");
          setDebouncedSearch("");
          setSelectedCategory("all");
          setActiveCategory("ca-phe");
        }}
      />
    );
  }

  return (
    <main className="coffee-app">
      <header className="coffee-header">
        <div>
          <a className="coffee-brand" href="#menu" aria-label="BrewLite - về đầu trang">
            BREWLITE
          </a>
          <p>Cà phê ngon, bắt đầu ngày mới</p>
        </div>

        <div className="coffee-header__actions">
          <Link
            aria-label={
              accountUser
                ? `Tài khoản của ${accountUser.fullName || accountUser.email}`
                : accountLoadFailed
                  ? "Không tải được tài khoản. Chạm để thử lại."
                  : "Đăng nhập tài khoản"
            }
            className="account-button"
            href={accountUser || accountLoadFailed ? "/profile" : "/login"}
          >
            <AccountIcon />
          </Link>
          <Link
            aria-label={`Giỏ hàng có ${itemCount} món`}
            className="cart-button"
            href="/cart"
          >
            <CartIcon />
            {itemCount > 0 && <span>{itemCount > 99 ? "99+" : itemCount}</span>}
          </Link>
        </div>
      </header>

      <section className="figma-menu" id="menu" aria-labelledby="menu-title">
        <Image
          className="coffee-mark"
          src="/products/coffee-mark.png"
          alt=""
          width={78}
          height={72}
          priority
        />
        <h1 id="menu-title">Menu hôm nay</h1>

        <div className="figma-search-wrap">
          <label className="figma-search-box" htmlFor="menu-search-input">
            <SearchIcon />
            <input
              ref={searchInputRef}
              id="menu-search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm cà phê, trà sữa, soda..."
              aria-label="Tìm kiếm món theo tên"
              autoComplete="off"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                className="figma-search-clear"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                  searchInputRef.current?.focus();
                }}
              >
                ×
              </button>
            )}
          </label>
        </div>

        {categories.length > 0 && (
          <div className="figma-category-pills" role="tablist" aria-label="Lọc theo danh mục">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === "all"}
              className={selectedCategory === "all" ? "is-active" : ""}
              onClick={() => setSelectedCategory("all")}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category.slug}
                className={selectedCategory === category.slug ? "is-active" : ""}
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {(hasActiveFilter || isSearching) && (
          <p className="figma-search-status" aria-live="polite">
            {isSearching
              ? "Đang tìm kiếm..."
              : `Tìm thấy ${products.length} món phù hợp`}
          </p>
        )}

        <div className="figma-menu__body">
          {categories.length > 0 && products.length > 0 && (
            <nav className="vertical-categories" aria-label="Đi đến danh mục">
              {categories
                .filter((category) =>
                  products.some((product) => product.category.slug === category.slug),
                )
                .map((category) => (
                  <button
                    className={activeCategory === category.slug ? "is-active" : ""}
                    type="button"
                    aria-current={activeCategory === category.slug ? "true" : undefined}
                    onClick={() => {
                      setActiveCategory(category.slug);
                      document
                        .getElementById(`category-${category.slug}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    key={category.id}
                  >
                    {category.name}
                  </button>
                ))}
            </nav>
          )}

          <div
            className={`figma-menu__content${isSearching ? " is-searching" : ""}`}
            ref={menuContentRef}
            aria-busy={isSearching}
          >
            {products.length === 0 ? (
              hasActiveFilter ? (
                <section className="figma-empty-state" aria-live="polite">
                  <span className="figma-empty-state__icon" aria-hidden="true">
                    <SearchIcon />
                  </span>
                  <h2>Không tìm thấy kết quả</h2>
                  <p>
                    Không có đồ uống nào khớp với{" "}
                    {debouncedSearch ? `"${debouncedSearch}"` : "danh mục đã chọn"}.
                  </p>
                  <button type="button" onClick={clearFilters}>
                    Xóa bộ lọc
                  </button>
                </section>
              ) : (
                <section className="figma-empty-state" aria-live="polite">
                  <h2>Menu đang được cập nhật</h2>
                  <p>Quay lại sau một chút để khám phá các món mới.</p>
                </section>
              )
            ) : (
              <div className="category-sections" aria-live="polite">
                {categories.map((category) => {
                  const categoryProducts = products.filter(
                    (product) => product.category.slug === category.slug,
                  );

                  if (categoryProducts.length === 0) {
                    return null;
                  }

                  return (
                    <section
                      className="category-section"
                      id={`category-${category.slug}`}
                      aria-labelledby={`category-title-${category.slug}`}
                      key={category.id}
                    >
                      <h2 className="sr-only" id={`category-title-${category.slug}`}>
                        {category.name}
                      </h2>
                      <div className="product-grid">
                        {categoryProducts.map((product) => (
                          <ProductCard product={product} key={product.id} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
