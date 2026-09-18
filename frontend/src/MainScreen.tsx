import { useEffect, useMemo, useState } from "react";

import { AgGridReact } from "ag-grid-react";

import {
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";

import type {
  CellClassParams,
  CellValueChangedEvent,
  ColDef,
  ValueFormatterParams,
} from "ag-grid-community";

import { format } from "date-fns";
import * as XLSX from "xlsx";

import { getInvoices } from "./api/invoiceApi";
import { getBanks } from "./api/bankApi";

import type { InvoiceRow } from "./types/invoice";
import type { Bank } from "./types/bank";

import "./App.css";

import {
  getInvoiceBankSelections,
  saveInvoiceBankSelections,
} from "./api/invoiceBankSelectionApi";

/* =========================================================
   AG GRID
   ========================================================= */

ModuleRegistry.registerModules([
  AllCommunityModule,
]);


/* =========================================================
   HELPER - FORMAT DATE
   ========================================================= */

function formatDisplayDate(
  value: string | null | undefined
): string {

  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "vi-VN"
  ).format(date);
}


/* =========================================================
   HELPER - FORMAT EXCEL
   ========================================================= */

function formatExcelCells(
  worksheet: XLSX.WorkSheet,
  rowCount: number
) {

  /*
   * B = Số hóa đơn
   * D = Folio
   * E = MST
   * T = Bank Account
   *
   * Các cột này bắt buộc TEXT
   * để không mất số 0 đầu.
   */

  for (
    let row = 2;
    row <= rowCount + 1;
    row++
  ) {

    ["B", "D", "E", "T"].forEach(
      (column) => {

        const cell =
          worksheet[
            `${column}${row}`
          ];

        if (cell) {
          cell.t = "s";

          cell.v = String(
            cell.v ?? ""
          );
        }
      }
    );


    /*
     * L = SubAmount
     * M = ServiceCharge
     * N = TaxAmount
     * O = TotalAmount
     * P = ExRate
     */

    [
      "L",
      "M",
      "N",
      "O",
      "P",
    ].forEach(
      (column) => {

        const cell =
          worksheet[
            `${column}${row}`
          ];

        if (cell) {
          cell.z = "#,##0.00";
        }
      }
    );
  }
}


/* =========================================================
   APP
   ========================================================= */

function MainScreen() {

  const today =
    format(
      new Date(),
      "yyyy-MM-dd"
    );

    const [saving, setSaving] = useState(false);

  /* =======================================================
     STATE
     ======================================================= */

  const [
    fromDate,
    setFromDate,
  ] = useState(today);

  const [
    toDate,
    setToDate,
  ] = useState(today);


  const [
    rows,
    setRows,
  ] = useState<InvoiceRow[]>([]);


  const [
    banks,
    setBanks,
  ] = useState<Bank[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  /* =======================================================
     LOAD BANKS
     ======================================================= */

  useEffect(() => {

    loadBanks();

  }, []);


  async function handleSave() {
  const bankRows = rows.filter(
    (row) =>
      isBankTransfer(row) &&
      row.selectedBankCode &&
      row.selectedAccountNumber
  );

  if (bankRows.length === 0) {
    alert("Không có dữ liệu Bank Transfer để lưu.");
    return;
  }

  try {
    setSaving(true);

    const dataToSave = bankRows.map((row) => ({
      billId: row.billId,
      folioNum: row.folioNum,
      billNumber: row.billNumber1From,
      bankCode: row.selectedBankCode!,
      accountNumber: row.selectedAccountNumber!,
    }));

    console.log("SAVE DATA:", dataToSave);

    await saveInvoiceBankSelections(dataToSave);

    alert(`Đã lưu ${dataToSave.length} hóa đơn thành công.`);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    alert("Lưu dữ liệu thất bại.");
  } finally {
    setSaving(false);
  }
}

  async function loadBanks() {

    try {

      const result =
        await getBanks();

      setBanks(result);

      console.log(
        "Banks loaded:",
        result
      );

    } catch (error) {

      console.error(
        "Load banks error:",
        error
      );

      setMessage(
        "Không tải được danh sách ngân hàng."
      );
    }
  }


  /* =======================================================
     LOAD INVOICES
     ======================================================= */

  async function loadInvoices() {

    if (!fromDate || !toDate) {
      setMessage("Vui lòng chọn từ ngày và đến ngày.");
      return;
    }

    if (fromDate > toDate) {
      setMessage("Từ ngày không được lớn hơn đến ngày.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Load song song hóa đơn Smile FO và lựa chọn Bank/Account đã lưu.
      const [data, savedSelections] = await Promise.all([
        getInvoices(fromDate, toDate),
        getInvoiceBankSelections(),
      ]);

      // Dùng billId làm khóa để phục hồi Bank/Account đã SAVE.
      const savedMap = new Map(
        savedSelections.map((item) => [Number(item.billId), item])
      );

      const mappedData: InvoiceRow[] = data.map((row) => {
        const saved = savedMap.get(Number(row.billId));

        if (!saved) {
          return {
            ...row,
            selectedBankCode: null,
            selectedAccountNumber: null,
          };
        }

        return {
          ...row,
          selectedBankCode: saved.bankCode,
          selectedAccountNumber: saved.accountNumber,
        };
      });

      console.log("SAVED BANK SELECTIONS:", savedSelections);
      console.log(
        "RESTORED BANK:",
        mappedData
          .filter((row) => row.selectedBankCode)
          .map((row) => ({
            billId: row.billId,
            billNumber: row.billNumber1From,
            bank: row.selectedBankCode,
            account: row.selectedAccountNumber,
          }))
      );

      setRows(mappedData);

      if (mappedData.length === 0) {
        setMessage("Không có hóa đơn trong khoảng ngày đã chọn.");
      }
    } catch (error) {
      console.error("Load invoices error:", error);
      setMessage("Có lỗi khi tải dữ liệu hóa đơn.");
    } finally {
      setLoading(false);
    }
  }


  /* =======================================================
     PAYMENT HELPERS
     ======================================================= */

  function isBankTransfer(
    row: InvoiceRow | undefined
  ): boolean {

    return (
      row
        ?.modeOfPayment
        ?.trim()
        .toUpperCase()
      ===
      "BANK TRANSFER"
    );
  }


 


  /* =======================================================
     COLUMN DEFINITIONS
     ======================================================= */

  const columnDefs =
    useMemo<
      ColDef<InvoiceRow>[]
    >(
      () => [

        /* -------------------------
           NGÀY HÓA ĐƠN
           ------------------------- */

        {
          headerName:
            "Ngày HĐ",

          field:
            "invDate",

          width:
            115,

          pinned:
            "left",

          valueFormatter:
            (
              params:
                ValueFormatterParams<
                  InvoiceRow
                >
            ) => {

              return formatDisplayDate(
                params.value
              );
            },
        },


        /* -------------------------
           SỐ HÓA ĐƠN
           ------------------------- */

        {
          headerName:
            "Số HĐ",

          field:
            "billNumber1From",

          width:
            110,

          pinned:
            "left",
        },


        /* -------------------------
           FOLIO
           ------------------------- */

        {
          headerName:
            "Folio",

          field:
            "folioNum",

          width:
            100,
        },


        /* -------------------------
           MST
           ------------------------- */

        {
          headerName:
            "MST",

          field:
            "vatCode",

          width:
            135,
        },


        /* -------------------------
           COMPANY
           ------------------------- */

        {
          headerName:
            "Công ty",

          field:
            "companyName",

          width:
            230,
        },


        /* -------------------------
           GUEST
           ------------------------- */

        {
          headerName:
            "Khách hàng",

          field:
            "guestName",

          width:
            200,
        },


        /* -------------------------
           ROOM
           ------------------------- */

        {
          headerName:
            "Phòng",

          field:
            "roomCode",

          width:
            90,
        },


        /* -------------------------
           TOTAL
           ------------------------- */

        {
          headerName:
            "Tổng tiền",

          field:
            "totalAmount",

          width:
            145,

          type:
            "numericColumn",

          valueFormatter:
            (
              params:
                ValueFormatterParams<
                  InvoiceRow
                >
            ) => {

              if (
                params.value == null
              ) {

                return "";
              }

              return Number(
                params.value
              ).toLocaleString(
                "vi-VN"
              );
            },
        },


        /* -------------------------
           PAYMENT
           ------------------------- */

        {
          headerName:
            "Thanh toán",

          field:
            "modeOfPayment",

          width:
            150,

          cellClass:
            (
              params:
                CellClassParams<
                  InvoiceRow
                >
            ) => {

              if (
                isBankTransfer(
                  params.data
                )
              ) {

                return (
                  "bank-transfer-cell"
                );
              }

              return "";
            },
        },


        /* =================================================
           BANK
           ================================================= */

        {
  headerName: "Bank",
  field: "selectedBankCode",
  width: 180,

  editable: (params) =>
    isBankTransfer(params.data),

  cellEditor: "agSelectCellEditor",

  cellEditorParams: () => ({
    values: banks.map(
      (bank) => bank.bankCode
    ),
  }),

  cellClass: (params) => {
    if (!isBankTransfer(params.data)) {
      return "disabled-cell";
    }

    if (!params.data?.selectedBankCode) {
      return "required-cell";
    }

    return "bank-input-cell";
  },
},


        /* =================================================
           ACCOUNT NUMBER
           ================================================= */

        {
  headerName: "Số tài khoản",
  field: "selectedAccountNumber",
  width: 210,

  editable: (params) =>
    isBankTransfer(params.data) &&
    !!params.data?.selectedBankCode,

  cellEditor: "agSelectCellEditor",

  cellEditorParams: (params: any) => {

    const bankCode =
      params.data?.selectedBankCode;

    const bank = banks.find(
      (item) =>
        item.bankCode === bankCode
    );

    const accounts =
      bank?.accounts ?? [];

    console.log(
      "Bank selected:",
      bankCode
    );

    console.log(
      "Accounts:",
      accounts
    );

    return {
      values: accounts.map(
        (account) =>
          account.accountNumber
      ),
    };
  },

  cellClass: (params) => {
    if (!isBankTransfer(params.data)) {
      return "disabled-cell";
    }

    if (!params.data?.selectedAccountNumber) {
      return "required-cell";
    }

    return "bank-input-cell";
  },
},


        /* -------------------------
           ADDRESS
           ------------------------- */

        {
          headerName:
            "Địa chỉ",

          field:
            "taAddress3",

          width:
            280,
        },


        /* -------------------------
           EMAIL
           ------------------------- */

        {
          headerName:
            "Email",

          field:
            "clientMail",

          width:
            230,
        },


        /* -------------------------
           CASHIER
           ------------------------- */

        {
          headerName:
            "Cashier",

          field:
            "printCashier",

          width:
            110,
        },

      ],

      [banks]
    );


  /* =======================================================
     CELL VALUE CHANGED
     ======================================================= */

    function onCellValueChanged(
  event: CellValueChangedEvent<InvoiceRow>
) {

  if (!event.data) {
    return;
  }


  /* =========================
     BANK CHANGED
     ========================= */

  if (
    event.colDef.field ===
    "selectedBankCode"
  ) {

    /*
     * Lưu trực tiếp:
     *
     * BIDV
     * CTG
     */

    event.data.selectedBankCode =
      event.newValue == null
        ? null
        : String(event.newValue);


    /*
     * Đổi Bank thì reset Account.
     */

    event.data.selectedAccountNumber =
      null;


    event.api.refreshCells({
      rowNodes: [
        event.node
      ],

      columns: [
        "selectedBankCode",
        "selectedAccountNumber",
      ],

      force: true,
    });
  }


  /* =========================
     ACCOUNT CHANGED
     ========================= */

  if (
    event.colDef.field ===
    "selectedAccountNumber"
  ) {

    event.data.selectedAccountNumber =
      event.newValue == null
        ? null
        : String(event.newValue);
  }


  setRows(
    (current) => [
      ...current
    ]
  );
}


  /* =======================================================
     SUMMARY
     ======================================================= */

  const bankTransferCount =
    rows.filter(
      (row) =>
        isBankTransfer(row)
    ).length;


  const missingBankCount =
    rows.filter(
      (row) =>

        isBankTransfer(row)

        &&

        (
          !row.selectedBankCode

          ||

          !row
            .selectedAccountNumber
        )

    ).length;


  const totalAmount =
    rows.reduce(
      (
        total,
        row
      ) => {

        return (
          total
          +
          Number(
            row.totalAmount
            ?? 0
          )
        );
      },

      0
    );


  const canExport =
    rows.length > 0
    &&
    missingBankCount === 0;


  /* =======================================================
     EXPORT EXCEL
     ======================================================= */

  function handleExport() {

  /* =====================================================
     1. VALIDATE
     ===================================================== */

  const invalidRows = rows.filter(
    (row) =>
      isBankTransfer(row) &&
      (
        !row.selectedBankCode ||
        !row.selectedAccountNumber
      )
  );

  if (invalidRows.length > 0) {
    setMessage(
      `Còn ${invalidRows.length} hóa đơn BANK TRANSFER chưa chọn Bank/Số tài khoản.`
    );
    return;
  }


  /* =====================================================
     2. BUILD EXCEL DATA
     ===================================================== */

  const excelData = rows.map((row) => {

    /*
     * Tìm Bank bằng BANK CODE.
     *
     * Ví dụ:
     * selectedBankCode = "BIDV"
     */

    const bank = row.selectedBankCode
      ? banks.find(
          (item) =>
            item.bankCode
              ?.trim()
              .toUpperCase()
            ===
            row.selectedBankCode
              ?.trim()
              .toUpperCase()
        )
      : undefined;


    /*
     * Tìm Account trong Bank.
     */

    const account = bank?.accounts?.find(
      (item) =>
        String(item.accountNumber).trim()
        ===
        String(
          row.selectedAccountNumber ?? ""
        ).trim()
    );


    /*
     * Debug.
     *
     * Sau khi chạy ổn có thể xóa.
     */

    if (isBankTransfer(row)) {
      console.log(
        "EXPORT BANK:",
        {
          invoice:
            row.billNumber1From,

          selectedBankCode:
            row.selectedBankCode,

          selectedAccountNumber:
            row.selectedAccountNumber,

          bank:
            bank,

          account:
            account,
        }
      );
    }


    return {

      "Ngày hóa đơn":
        formatDisplayDate(
          row.invDate
        ),

      "Số hóa đơn":
        row.billNumber1From ?? "",

      "Ký hiệu":
        row.billSeri1 ?? "",

      "Folio":
        row.folioNum ?? "",

      "MST":
        row.vatCode ?? "",

      "Tên công ty":
        row.companyName ?? "",

      "Tên khách":
        row.guestName ?? "",

      "Địa chỉ":
        row.taAddress3
        ??
        row.address1
        ??
        "",

      "Phòng":
        row.roomCode ?? "",

      "Ngày đến":
        formatDisplayDate(
          row.arrivalDate
        ),

      "Ngày đi":
        formatDisplayDate(
          row.departureDate
        ),

      "Tiền trước thuế":
        row.subAmount ?? 0,

      "Service Charge":
        row.serviceCharge ?? 0,

      "Tiền thuế":
        row.taxAmount ?? 0,

      "Tổng tiền":
        row.totalAmount ?? 0,

      "Tỷ giá":
        row.exRate ?? 0,

      "Hình thức thanh toán":
        row.modeOfPayment ?? "",


      /* ==========================
         BANK
         ========================== */

      "Bank Code":
        row.selectedBankCode ?? "",

      "Bank Name":
        bank?.bankName ?? "",

      "Bank Account":
        row.selectedAccountNumber ?? "",

      "Bank Account Name":
        account?.accountName ?? "",

      "Currency":
        account?.currency ?? "",


      /* ==========================
         OTHER
         ========================== */

      "Email":
        row.clientMail ?? "",

      "Cashier":
        row.printCashier ?? "",

      "Bill ID":
        row.billId ?? "",

      "Bill Note":
        row.billNote ?? "",
    };
  });


  /* =====================================================
     3. CREATE WORKSHEET
     ===================================================== */

  const worksheet =
    XLSX.utils.json_to_sheet(
      excelData
    );


  /* =====================================================
     4. COLUMN WIDTH
     ===================================================== */

  worksheet["!cols"] = [

    { wch: 14 }, // A Ngày HĐ
    { wch: 16 }, // B Số HĐ
    { wch: 16 }, // C Ký hiệu
    { wch: 14 }, // D Folio
    { wch: 18 }, // E MST

    { wch: 35 }, // F Company
    { wch: 30 }, // G Guest
    { wch: 45 }, // H Address

    { wch: 12 }, // I Room

    { wch: 14 }, // J Arrival
    { wch: 14 }, // K Departure

    { wch: 18 }, // L SubAmount
    { wch: 18 }, // M Service
    { wch: 18 }, // N Tax
    { wch: 18 }, // O Total
    { wch: 15 }, // P Exchange

    { wch: 22 }, // Q Payment

    { wch: 15 }, // R Bank Code
    { wch: 25 }, // S Bank Name
    { wch: 25 }, // T Bank Account
    { wch: 35 }, // U Account Name
    { wch: 12 }, // V Currency

    { wch: 35 }, // W Email
    { wch: 15 }, // X Cashier
    { wch: 15 }, // Y Bill ID
    { wch: 35 }, // Z Note
  ];


  /* =====================================================
     5. FORMAT EXCEL
     ===================================================== */

  formatExcelCells(
    worksheet,
    excelData.length
  );


  /* =====================================================
     6. WORKBOOK
     ===================================================== */

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Invoices"
  );


  /* =====================================================
     7. FILE NAME
     ===================================================== */

  const fileName =
    `SmileFO_Invoice_${fromDate.replaceAll(
      "-",
      ""
    )}_${toDate.replaceAll(
      "-",
      ""
    )}.xlsx`;


  XLSX.writeFile(
    workbook,
    fileName
  );


  setMessage(
    `Đã export ${rows.length} hóa đơn.`
  );
}


  /* =======================================================
     UI
     ======================================================= */

  return (

    <div className="app">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="header">

        <div>

          <h1>
            SMILE FO → FAST
          </h1>

          <p>
            Xuất hóa đơn Smile FO sang dữ liệu FAST
          </p>

        </div>

      </div>


      {/* ===================================================
          FILTER
          =================================================== */}

      <div className="filter-panel">

        <div className="filter-item">

          <label>
            Từ ngày
          </label>

          <input
            type="date"

            value={
              fromDate
            }

            onChange={
              (event) =>
                setFromDate(
                  event.target.value
                )
            }
          />

        </div>


        <div className="filter-item">

          <label>
            Đến ngày
          </label>

          <input
            type="date"

            value={
              toDate
            }

            onChange={
              (event) =>
                setToDate(
                  event.target.value
                )
            }
          />

        </div>


        <button
          className="load-button"

          onClick={
            loadInvoices
          }

          disabled={
            loading
          }
        >

          {
            loading
              ? "ĐANG TẢI..."
              : "TẢI DỮ LIỆU"
          }

        </button>

      </div>


      {/* ===================================================
          SUMMARY
          =================================================== */}

      <div className="summary">

        <div>

          <span>
            Hóa đơn
          </span>

          <strong>
            {rows.length}
          </strong>

        </div>


        <div>

          <span>
            Bank Transfer
          </span>

          <strong>
            {bankTransferCount}
          </strong>

        </div>


        <div
          className={
            missingBankCount > 0
              ? "summary-warning"
              : ""
          }
        >

          <span>
            Thiếu Bank
          </span>

          <strong>
            {missingBankCount}
          </strong>

        </div>


        <div>

          <span>
            Tổng tiền
          </span>

          <strong>

            {
              totalAmount
                .toLocaleString(
                  "vi-VN"
                )
            }

          </strong>

        </div>

      </div>


      {/* ===================================================
          MESSAGE
          =================================================== */}

      {
        message && (

          <div className="message">

            {message}

          </div>

        )
      }


      {/* ===================================================
          GRID
          =================================================== */}

      <div className="grid-container">

        <AgGridReact<InvoiceRow>

          rowData={
            rows
          }

          columnDefs={
            columnDefs
          }

          defaultColDef={{
            sortable:
              true,

            filter:
              true,

            resizable:
              true,
          }}

          onCellValueChanged={
            onCellValueChanged
          }

          getRowId={
            (params) =>

              params.data.billId

              ??

              `${params.data.folioNum}-${params.data.billNumber1From}`
          }

        />

      </div>


      {/* ===================================================
          FOOTER
          =================================================== */}

      <div className="footer-actions">

        <div className="export-status">

          {
            missingBankCount > 0

              ?

              `${missingBankCount} hóa đơn BANK TRANSFER chưa đủ thông tin Bank`

              :

              rows.length > 0

                ?

                "Dữ liệu hợp lệ để Export"

                :

                ""
          }

        </div>


<div className="action-buttons">

  <button
    className="save-button"
    onClick={handleSave}
    disabled={!canExport || saving}
  >
    {saving ? "SAVING..." : "SAVE"}
  </button>

  <button
    className="export-button"
    onClick={handleExport}
    disabled={!canExport}
  >
    EXPORT EXCEL
  </button>

</div>

      </div>

    </div>
  );
}


export default MainScreen;