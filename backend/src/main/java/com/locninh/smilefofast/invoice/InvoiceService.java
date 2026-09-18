package com.locninh.smilefofast.invoice;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository repository;

    public InvoiceService(
            InvoiceRepository repository
    ) {
        this.repository = repository;
    }

    public List<InvoiceRow> getInvoices(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate == null || toDate == null) {
            throw new IllegalArgumentException(
                    "fromDate và toDate là bắt buộc."
            );
        }

        if (fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException(
                    "Từ ngày không được lớn hơn đến ngày."
            );
        }

        return repository.findInvoices(
                fromDate,
                toDate
        );
    }
}