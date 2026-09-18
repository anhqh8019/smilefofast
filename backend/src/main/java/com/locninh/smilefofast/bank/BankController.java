package com.locninh.smilefofast.bank;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banks")
public class BankController {

    private final BankService service;

    public BankController(
            BankService service
    ) {
        this.service = service;
    }

    @GetMapping
    public List<Bank> getBanks() {

        return service.getBanks();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createBank(
            @RequestBody BankRequest request
    ) {

        service.createBank(request);
    }

    @PostMapping("/{bankId}/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public void createAccount(

            @PathVariable Integer bankId,

            @RequestBody
            BankAccountRequest request
    ) {

        service.createAccount(
                bankId,
                request
        );
    }

    @PatchMapping("/{bankId}/active")
    public void setBankActive(

            @PathVariable Integer bankId,

            @RequestParam boolean value
    ) {

        service.setBankActive(
                bankId,
                value
        );
    }

    @PatchMapping("/accounts/{accountId}/active")
    public void setAccountActive(

            @PathVariable Integer accountId,

            @RequestParam boolean value
    ) {

        service.setAccountActive(
                accountId,
                value
        );
    }
}