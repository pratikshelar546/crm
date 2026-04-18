import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { DataGrid, type GridColDef, type GridFilterModel, GridToolbar } from "@mui/x-data-grid";
import { useNewLeadModal } from "../components/NewLeadModalContext";
import { fetchLeads } from "../api/leads";
import { STATUS_LABELS } from "../constants/leads";
import type { Lead, LeadStatus } from "../types/leads";
import { getApiErrorMessage } from "../lib/http";

export function LeadsPage() {
  const navigate = useNavigate();
  const { openNewLead } = useNewLeadModal();
  const [rows, setRows] = useState<Lead[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [sortByField, setSortByField] = useState<"date" | "budget">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim();
      setSearch(next);
      setPaginationModel((p) => ({ ...p, page: 0 }));
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const columns = useMemo<GridColDef<Lead>[]>(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 170,
        renderCell: (params) => (
          <div className="flex h-full items-center">
            <span className="font-medium text-slate-900">{params.value}</span>
          </div>
        ),
      },
      {
        field: "contact",
        headerName: "Contact",
        flex: 1.25,
        minWidth: 220,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <div className="flex flex-col py-1">
            <span className="text-slate-800">{params.row.phoneNumber}</span>
            <span className="text-xs text-slate-500">{params.row.email}</span>
          </div>
        ),
      },
      {
        field: "budget",
        headerName: "Budget",
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        valueFormatter: (value) => `₹${Number(value).toLocaleString()}`,
      },
      {
        field: "location",
        headerName: "Location",
        flex: 1,
        minWidth: 170,
      },
      {
        field: "leadSource",
        headerName: "Source",
        minWidth: 130,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        type: "singleSelect",
        valueOptions: Object.keys(STATUS_LABELS),
        valueFormatter: (value) => STATUS_LABELS[value as LeadStatus] ?? String(value),
        renderCell: (params) => {
          const status = params.value as LeadStatus;
          const statusClass =
            status === "CLOSED"
              ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
              : status === "CONTACTED"
                ? "bg-indigo-100 text-indigo-700 ring-indigo-200"
                : status === "SITE_VISITED"
                  ? "bg-amber-100 text-amber-700 ring-amber-200"
                  : "bg-slate-100 text-slate-700 ring-slate-200";

          return (
            <div className="flex h-full items-center">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    let active = true;
    const loadingTimer = window.setTimeout(() => {
      if (active) setLoading(true);
    }, 0);
    const sourceFilter = filterModel.items.find((item) => item.field === "leadSource")?.value;
    const statusFilter = filterModel.items.find((item) => item.field === "status")?.value;
    void fetchLeads({
      search: search || undefined,
      leadSource: typeof sourceFilter === "string" ? sourceFilter : undefined,
      status: typeof statusFilter === "string" ? (statusFilter as LeadStatus) : undefined,
      sortBy: sortByField,
      sortOrder,
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    })
      .then((data) => {
        if (!active) return;
        setRows(data.items);
        setRowCount(data.total);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setRows([]);
        setRowCount(0);
        setError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
      window.clearTimeout(loadingTimer);
    };
  }, [filterModel, paginationModel.page, paginationModel.pageSize, sortByField, sortOrder, search]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search and sort below; use column menus to filter source and status.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-800"
          onClick={openNewLead}
        >
          Add lead
        </button>
      </div>

      {error && (
        <div
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="leads-search"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Search by name or phone
            </label>
            <TextField
              id="leads-search"
              fullWidth
              size="small"
              placeholder="Type a name or phone number…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search leads by name or phone number"
              slotProps={{
                htmlInput: { autoComplete: "off" },
              }}
              sx={{
                maxWidth: 440,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                },
              }}
            />
          </div>

          <div className="flex flex-wrap items-end gap-3 lg:shrink-0">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="leads-sort-by">Sort by</InputLabel>
              <Select
                labelId="leads-sort-by"
                id="leads-sort-by-select"
                label="Sort by"
                value={sortByField}
                onChange={(e) => {
                  setLoading(true);
                  setSortByField(e.target.value as "date" | "budget");
                  setPaginationModel((p) => ({ ...p, page: 0 }));
                }}
              >
                <MenuItem value="date">Date added</MenuItem>
                <MenuItem value="budget">Budget</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="leads-sort-order">Order</InputLabel>
              <Select
                labelId="leads-sort-order"
                id="leads-sort-order-select"
                label="Order"
                value={sortOrder}
                onChange={(e) => {
                  setLoading(true);
                  setSortOrder(e.target.value as "asc" | "desc");
                  setPaginationModel((p) => ({ ...p, page: 0 }));
                }}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      <Box className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          rowCount={rowCount}
          loading={loading}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          disableColumnSorting
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => {
            setLoading(true);
            setPaginationModel(model);
          }}
          sortModel={
            sortByField === "budget" ? [{ field: "budget", sort: sortOrder }] : []
          }
          filterModel={filterModel}
          onFilterModelChange={(model) => {
            setLoading(true);
            setFilterModel(model);
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/leads/${params.id}`)}
          autoHeight
          rowHeight={60}
          columnHeaderHeight={52}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
            },
          }}
          sx={{
            border: 0,
            fontSize: 14,
            backgroundColor: "#ffffff",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              color: "#334155",
            },
            "& .MuiDataGrid-cell": {
              borderBottomColor: "#f1f5f9",
              color: "#0f172a",
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#fcfdff",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f1f5f9",
              cursor: "pointer",
            },
            "& .MuiDataGrid-toolbarContainer": {
              padding: "12px 14px",
              borderBottom: "1px solid #f1f5f9",
              backgroundColor: "#ffffff",
              gap: "8px",
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-root": {
              textTransform: "none",
              fontWeight: 500,
              color: "#334155",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #f1f5f9",
              minHeight: "48px",
            },
          }}
        />
      </Box>
    </div>
  );
}
