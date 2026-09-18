package com.locninh.smilefofast.invoice;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class InvoiceRepository {

    private final JdbcTemplate jdbcTemplate;

    public InvoiceRepository(
            @Qualifier("smileFoJdbcTemplate")
            JdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }


    private static final String SQL = """
        SELECT
            B1.FolioNum,
            B1.FolioSubNum,
            B1.BalanceCode,
            B1.TaxCode,

            B1.BillSeri1,
            B1.BillSeri2,

            B1.BillNumber1From,
            B1.BillNumber1To,
            B1.BillNumber2From,
            B1.BillNumber2To,

            B1.BillID,

            dbo.fTCVNToUnicode(B1.BillInfor) AS BillInfor,

            dbo.fTCVNToUnicode(B1.CompanyName) AS CompanyName,

            dbo.fTCVNToUnicode(B1.Address1) AS Address1,

            B1.VATCode,

            dbo.fTCVNToUnicode(B1.GuestName) AS GuestName,

            B1.TotalAmount,
            B1.SubAmount,
            B1.ServiceCharge,
            B1.TaxAmount,

            B1.PrintDate,
            B1.PrintCashier,

            B1.ExRate,

            B1.PrintSumaryFlag,
            B1.PostToGL,
            B1.iPrintStyle,

            B1.BillNote,
            B1.InvDate,

            F1.ArrivalDate,
            F1.DepartureDate,
            F1.RoomCode,

            COALESCE(C1.Email, '') AS ClientMail,

            COALESCE(dbo.fTCVNToUnicode(B1.Address1), '')
            +
            COALESCE(dbo.fTCVNToUnicode(B1.Address2), '')
                AS TaAddress3,

            B1.ModeOfPayment

        FROM dbo.BillInfor AS B1

        LEFT OUTER JOIN dbo.Folio AS F1
            ON F1.FolioNum = B1.FolioNum

        LEFT OUTER JOIN dbo.CLIENT AS C1
            ON C1.ClientFolioNum = F1.TravelAgent1Code

        WHERE
            COALESCE(B1.Cancel, 0) = 0

            AND COALESCE(B1.BillNumber1From, '') <> ''

            AND B1.InvDate >= ?

            AND B1.InvDate < DATEADD(DAY, 1, ?)

        ORDER BY
            B1.InvDate,
            B1.BillNumber1From
        """;

    public List<InvoiceRow> findInvoices(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        return jdbcTemplate.query(
                SQL,
                this::mapRow,
                fromDate,
                toDate
        );
    }

    private InvoiceRow mapRow(
            ResultSet rs,
            int rowNum
    ) throws SQLException {

        return new InvoiceRow(
                getString(rs, "FolioNum"),
                getString(rs, "FolioSubNum"),
                getString(rs, "BalanceCode"),
                getString(rs, "TaxCode"),

                getString(rs, "BillSeri1"),
                getString(rs, "BillSeri2"),

                getString(rs, "BillNumber1From"),
                getString(rs, "BillNumber1To"),
                getString(rs, "BillNumber2From"),
                getString(rs, "BillNumber2To"),

                getString(rs, "BillID"),
                getString(rs, "BillInfor"),

                getString(rs, "CompanyName"),
                getString(rs, "Address1"),
                getString(rs, "VATCode"),
                getString(rs, "GuestName"),

                rs.getBigDecimal("TotalAmount"),
                rs.getBigDecimal("SubAmount"),
                rs.getBigDecimal("ServiceCharge"),
                rs.getBigDecimal("TaxAmount"),

                getLocalDateTime(rs, "PrintDate"),
                getString(rs, "PrintCashier"),

                rs.getBigDecimal("ExRate"),

                getInteger(rs, "PrintSumaryFlag"),
                getInteger(rs, "PostToGL"),
                getInteger(rs, "iPrintStyle"),

                getString(rs, "BillNote"),

                getLocalDateTime(rs, "InvDate"),
                getLocalDateTime(rs, "ArrivalDate"),
                getLocalDateTime(rs, "DepartureDate"),

                getString(rs, "RoomCode"),
                getString(rs, "ClientMail"),
                getString(rs, "TaAddress3"),

                getString(rs, "ModeOfPayment")
        );
    }

    private String getString(
            ResultSet rs,
            String column
    ) throws SQLException {

        Object value = rs.getObject(column);

        return value == null
                ? null
                : value.toString().trim();
    }

    private Integer getInteger(
            ResultSet rs,
            String column
    ) throws SQLException {

        Object value = rs.getObject(column);

        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        return Integer.valueOf(value.toString());
    }

    private LocalDateTime getLocalDateTime(
            ResultSet rs,
            String column
    ) throws SQLException {

        Timestamp timestamp = rs.getTimestamp(column);

        return timestamp == null
                ? null
                : timestamp.toLocalDateTime();
    }
}