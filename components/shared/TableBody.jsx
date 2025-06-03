"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const TableBody = ({ tableInstance, pagination, handlePageSizeChange, handlePageChange, isLoading }) => {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } = tableInstance;

  return (
    <div className="min-w-full table-custom-container hidden sm:block">
      <div className="overflow-x-auto table-custom">
        <table
          className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700 table"
          {...getTableProps()}
        >
          <thead className="bg-[#e6f6f0] dark:bg-slate-700">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="!border-b-0">
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="table-th">
                    {column.render("Header")}
                    <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700 !border-t-0"
            {...getTableBodyProps()}
          >
            {isLoading ? (
              <tr>
                <td colSpan={headerGroups[0].headers.length} className="text-center py-4">
                  <Icon icon="eos-icons:loading" className="text-3xl text-black-500 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading data...</p>
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="table-td">
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={headerGroups[0].headers.length} className="text-center py-4">
                  <p className="text-gray-500">No data available</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        {/* Items Per Page */}
        <div className="flex items-center space-x-3">
          <select
            className="form-control py-2"
            value={pagination.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100, 500, 1000].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>

        {/* Pagination Buttons */}
        <ul className="flex items-center space-x-3 rtl:space-x-reverse">
          <li>
            <button
              className={` ${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage === 1}
            >
              <Icon icon="heroicons:chevron-double-left-solid" />
            </button>
          </li>

          <li>
            <button
              className={` ${pagination.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handlePageChange(Math.max(pagination.currentPage - 1, 0))}
              disabled={pagination.currentPage === 1}
            >
              Prev
            </button>
          </li>

          {(() => {
            const pageButtons = [];
            const total = pagination.totalPages;
            const current = pagination.currentPage;
            const maxButtons = 5; // You can adjust this limit

            const generateButton = (pageNum) => (
              <li key={pageNum}>
                <button
                  className={`${
                    pageNum === current
                      ? "bg-black-500 dark:bg-slate-600 text-white font-medium"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-900 font-normal"
                  } text-sm rounded flex h-6 w-6 items-center justify-center transition-all duration-150`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            );

            if (total <= maxButtons + 2) {
              for (let i = 1; i <= total; i++) {
                pageButtons.push(generateButton(i));
              }
            } else {
              pageButtons.push(generateButton(1));

              if (current > 3) {
                pageButtons.push(<li key="start-ellipsis">...</li>);
              }

              const start = Math.max(2, current - 1);
              const end = Math.min(total - 1, current + 1);

              for (let i = start; i <= end; i++) {
                pageButtons.push(generateButton(i));
              }

              if (current < total - 2) {
                pageButtons.push(<li key="end-ellipsis">...</li>);
              }

              pageButtons.push(generateButton(total));
            }

            return pageButtons;
          })()}
          <li>
            <button
              className={` ${
                pagination.currentPage >= pagination.totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() =>
                handlePageChange(Math.min(pagination.currentPage + 1, pagination.totalPages - 1))
              }
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </button>
          </li>

          <li>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className={` ${
                pagination.currentPage >= pagination.totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Icon icon="heroicons:chevron-double-right-solid" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TableBody;
