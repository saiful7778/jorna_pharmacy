import { useMemo } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import type { PaginationMeta } from "@/db/utils";

import { Button } from "./ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "./ui/pagination";

interface MetaPaginationProps {
  meta: PaginationMeta;
  siblingCount?: number;
  onPageChange: (page: number) => void;
}

export function MetaPagination({
  meta,
  siblingCount = 1,
  onPageChange,
}: MetaPaginationProps) {
  const pages = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    const pageNumbers: (number | "ellipsis")[] = [];

    if (meta.pageCount <= totalPageNumbers) {
      // Show all pages
      for (let i = 1; i <= meta.pageCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(meta.currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(
        meta.currentPage + siblingCount,
        meta.pageCount
      );

      const showLeftEllipsis = leftSiblingIndex > 2;
      const showRightEllipsis = rightSiblingIndex < meta.pageCount - 1;

      // First page
      pageNumbers.push(1);

      // Left ellipsis
      if (showLeftEllipsis) {
        pageNumbers.push("ellipsis");
      }

      // Middle pages
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i !== 1 && i !== meta.pageCount) {
          pageNumbers.push(i);
        }
      }

      // Right ellipsis
      if (showRightEllipsis) {
        pageNumbers.push("ellipsis");
      }

      // Last page
      if (meta.pageCount > 1) {
        pageNumbers.push(meta.pageCount);
      }
    }

    return pageNumbers;
  }, [meta.currentPage, meta.pageCount, siblingCount]);

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <Button
            variant="ghost"
            disabled={meta.isFirstPage}
            aria-disabled={meta.isFirstPage}
            data-slot="pagination-link"
            aria-label="Go to previous page"
            onClick={() => onPageChange(meta.previousPage ?? 1)}
          >
            <ChevronLeftIcon
              data-icon="inline-start"
              className="rtl:rotate-180"
            />
            <span className="hidden sm:block">Previous</span>
          </Button>
        </PaginationItem>

        {/* Page Numbers */}
        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <Button
                size="icon"
                variant={page === meta.currentPage ? "outline" : "ghost"}
                aria-current={page === meta.currentPage ? "page" : undefined}
                data-slot="pagination-link"
                data-active={page === meta.currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <Button
            variant="ghost"
            aria-label="Go to next page"
            disabled={meta.isLastPage}
            aria-disabled={meta.isLastPage}
            data-slot="pagination-link"
            onClick={() => onPageChange(meta.nextPage ?? meta.pageCount)}
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon
              data-icon="inline-end"
              className="rtl:rotate-180"
            />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
