package com.locninh.smilefofast.bank;

public record BankAccount(
        Integer id,
        Integer bankId,
        String accountNumber,
        String accountName,
        String currency,
        Boolean active,
        Integer sortOrder
) {
}