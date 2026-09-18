package com.locninh.smilefofast.bank;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BankService {

    private final BankRepository repository;

    public BankService(
            BankRepository repository
    ) {
        this.repository = repository;
    }

    public List<Bank> getBanks() {
        return repository.findAllActive();
    }

    public void createBank(
            BankRequest request
    ) {

        if (request.bankCode() == null ||
                request.bankCode().isBlank()) {

            throw new IllegalArgumentException(
                    "BankCode là bắt buộc."
            );
        }

        if (request.bankName() == null ||
                request.bankName().isBlank()) {

            throw new IllegalArgumentException(
                    "BankName là bắt buộc."
            );
        }

        repository.createBank(request);
    }

    public void createAccount(
            Integer bankId,
            BankAccountRequest request
    ) {

        if (bankId == null) {
            throw new IllegalArgumentException(
                    "BankId là bắt buộc."
            );
        }

        if (request.accountNumber() == null ||
                request.accountNumber().isBlank()) {

            throw new IllegalArgumentException(
                    "Số tài khoản là bắt buộc."
            );
        }

        repository.createAccount(
                bankId,
                request
        );
    }

    public void setBankActive(
            Integer bankId,
            boolean active
    ) {

        repository.setBankActive(
                bankId,
                active
        );
    }

    public void setAccountActive(
            Integer accountId,
            boolean active
    ) {

        repository.setAccountActive(
                accountId,
                active
        );
    }
}