import { createElement, lazy, Suspense, type ComponentType } from "react";
import RouteLoadingFallback from "@/app/routing/RouteLoadingFallback";

type LazyPageModule = {
  default: ComponentType;
};

type LazyPageLoader = () => Promise<LazyPageModule>;

export function lazyRoutePage(loader: LazyPageLoader): ComponentType {
  const Page = lazy(loader);

  return function LazyRoutePage() {
    return createElement(
      Suspense,
      { fallback: createElement(RouteLoadingFallback) },
      createElement(Page)
    );
  };
}
