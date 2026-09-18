package com.locninh.smilefofast.model;

public record InvoiceBankSelection(
        Integer billId,
        Integer folioNum,
        String billNumber,
        String bankCode,
        String accountNumber
) {
}