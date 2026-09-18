package com.locninh.smilefofast.controller;

import com.locninh.smilefofast.model.InvoiceBankSelection;
import com.locninh.smilefofast.repository.InvoiceBankSelectionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoice-bank-selections")
public class InvoiceBankSelectionController {

    private final InvoiceBankSelectionRepository repository;

    public InvoiceBankSelectionController(
            InvoiceBankSelectionRepository repository
    ) {
        this.repository = repository;
    }

    @GetMapping
    public List<InvoiceBankSelection> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public void save(
            @RequestBody List<InvoiceBankSelection> items
    ) {
        for (InvoiceBankSelection item : items) {
            repository.save(item);
        }
    }
}