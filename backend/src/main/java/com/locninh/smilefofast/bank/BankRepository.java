package com.locninh.smilefofast.bank;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class BankRepository {

    private final JdbcTemplate jdbcTemplate;

    public BankRepository(
            @Qualifier("integrationJdbcTemplate")
            JdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Bank> findAllActive() {

        String sql = """
        SELECT
            B.Id            AS BankId,
            B.BankCode,
            B.BankName,
            B.IsActive      AS BankIsActive,
            B.SortOrder     AS BankSortOrder,

            A.Id            AS AccountId,
            A.AccountNumber,
            A.AccountName,
            A.Currency,
            A.IsActive      AS AccountIsActive,
            A.SortOrder     AS AccountSortOrder

        FROM dbo.SupportedBank B

        LEFT JOIN dbo.SupportedBankAccount A
            ON A.BankId = B.Id
            AND A.IsActive = 1

        WHERE B.IsActive = 1

        ORDER BY
            B.SortOrder,
            B.BankName,
            A.SortOrder,
            A.AccountNumber
        """;

        ResultSetExtractor<List<Bank>> extractor =
                this::mapBanks;

        return jdbcTemplate.query(
                sql,
                extractor
        );
    }

    private List<Bank> mapBanks(
            ResultSet rs
    ) throws SQLException {

        List<Bank> result = new ArrayList<>();

        Integer currentBankId = null;

        String bankCode = null;
        String bankName = null;
        Boolean bankActive = null;
        Integer bankSortOrder = null;

        List<BankAccount> accounts = null;

        while (rs.next()) {

            int rowBankId = rs.getInt("BankId");

            /*
             * Gặp Bank mới:
             * - lưu Bank cũ vào result
             * - tạo danh sách account mới
             */
            if (currentBankId == null ||
                    currentBankId != rowBankId) {

                if (currentBankId != null) {

                    result.add(
                            new Bank(
                                    currentBankId,
                                    bankCode,
                                    bankName,
                                    bankActive,
                                    bankSortOrder,
                                    accounts
                            )
                    );
                }

                currentBankId = rowBankId;

                bankCode =
                        rs.getString("BankCode");

                bankName =
                        rs.getString("BankName");

                bankActive =
                        rs.getBoolean("BankIsActive");

                bankSortOrder =
                        rs.getInt("BankSortOrder");

                accounts = new ArrayList<>();
            }

            /*
             * LEFT JOIN:
             * Bank có thể chưa có account.
             */
            Object accountIdObject =
                    rs.getObject("AccountId");

            if (accountIdObject != null) {

                accounts.add(
                        new BankAccount(
                                rs.getInt("AccountId"),
                                rowBankId,
                                rs.getString("AccountNumber"),
                                rs.getString("AccountName"),
                                rs.getString("Currency"),
                                rs.getBoolean("AccountIsActive"),
                                rs.getInt("AccountSortOrder")
                        )
                );
            }
        }

        /*
         * Add Bank cuối cùng.
         */
        if (currentBankId != null) {

            result.add(
                    new Bank(
                            currentBankId,
                            bankCode,
                            bankName,
                            bankActive,
                            bankSortOrder,
                            accounts
                    )
            );
        }

        return result;
    }


    public int createBank(
            BankRequest request
    ) {

        String sql = """
        INSERT INTO dbo.SupportedBank
        (
            BankCode,
            BankName,
            IsActive,
            SortOrder
        )
        VALUES (?, ?, 1, ?)
        """;

        return jdbcTemplate.update(
                sql,
                request.bankCode().trim().toUpperCase(),
                request.bankName().trim(),
                request.sortOrder() == null
                        ? 0
                        : request.sortOrder()
        );
    }


    public int createAccount(
            Integer bankId,
            BankAccountRequest request
    ) {

        String sql = """
        INSERT INTO dbo.SupportedBankAccount
        (
            BankId,
            AccountNumber,
            AccountName,
            Currency,
            IsActive,
            SortOrder
        )
        VALUES (?, ?, ?, ?, 1, ?)
        """;

        return jdbcTemplate.update(
                sql,
                bankId,
                request.accountNumber().trim(),
                request.accountName(),
                request.currency() == null
                        ? "VND"
                        : request.currency().trim().toUpperCase(),
                request.sortOrder() == null
                        ? 0
                        : request.sortOrder()
        );
    }

    public int setBankActive(
            Integer bankId,
            boolean active
    ) {

        String sql = """
        UPDATE dbo.SupportedBank
        SET
            IsActive = ?,
            UpdatedAt = SYSDATETIME()
        WHERE Id = ?
        """;

        return jdbcTemplate.update(
                sql,
                active,
                bankId
        );
    }


    public int setAccountActive(
            Integer accountId,
            boolean active
    ) {

        String sql = """
        UPDATE dbo.SupportedBankAccount
        SET
            IsActive = ?,
            UpdatedAt = SYSDATETIME()
        WHERE Id = ?
        """;

        return jdbcTemplate.update(
                sql,
                active,
                accountId
        );
    }

}