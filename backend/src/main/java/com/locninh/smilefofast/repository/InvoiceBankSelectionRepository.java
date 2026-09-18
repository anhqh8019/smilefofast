package com.locninh.smilefofast.repository;

import com.locninh.smilefofast.model.InvoiceBankSelection;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class InvoiceBankSelectionRepository {

    private final JdbcTemplate jdbcTemplate;

    public InvoiceBankSelectionRepository(
            @Qualifier("integrationJdbcTemplate")
            JdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<InvoiceBankSelection> findAll() {

        String sql = """
                SELECT
                    BillId,
                    FolioNum,
                    BillNumber,
                    BankCode,
                    AccountNumber
                FROM dbo.InvoiceBankSelection
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new InvoiceBankSelection(
                        rs.getInt("BillId"),
                        (Integer) rs.getObject("FolioNum"),
                        rs.getString("BillNumber"),
                        rs.getString("BankCode"),
                        rs.getString("AccountNumber")
                )
        );
    }

    public void save(InvoiceBankSelection item) {

        String sql = """
                UPDATE dbo.InvoiceBankSelection
                SET
                    FolioNum = ?,
                    BillNumber = ?,
                    BankCode = ?,
                    AccountNumber = ?,
                    UpdatedAt = SYSDATETIME()
                WHERE BillId = ?;

                IF @@ROWCOUNT = 0
                BEGIN
                    INSERT INTO dbo.InvoiceBankSelection
                    (
                        BillID,
                        FolioNum,
                        BillNumber,
                        BankCode,
                        AccountNumber
                    )
                    VALUES (?, ?, ?, ?, ?);
                END
                """;

        jdbcTemplate.update(
                sql,

                item.folioNum(),
                item.billNumber(),
                item.bankCode(),
                item.accountNumber(),
                item.billId(),

                item.billId(),
                item.folioNum(),
                item.billNumber(),
                item.bankCode(),
                item.accountNumber()
        );
    }
}