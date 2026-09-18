package com.locninh.smilefofast.bank;

public record BankAccountRequest(
        String accountNumber,
        String accountName,
        String currency,
        Integer sortOrder
) {
}