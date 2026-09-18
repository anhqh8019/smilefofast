package com.locninh.smilefofast.bank;

public record BankRequest(
        String bankCode,
        String bankName,
        Integer sortOrder
) {
}