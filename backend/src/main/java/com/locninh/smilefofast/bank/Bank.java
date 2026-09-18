package com.locninh.smilefofast.bank;

import java.util.List;

public record Bank(
        Integer id,
        String bankCode,
        String bankName,
        Boolean active,
        Integer sortOrder,
        List<BankAccount> accounts
) {
}